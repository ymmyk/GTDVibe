#!/usr/bin/env bash
set -euo pipefail

# Full GTD lifecycle integration test via `spacetime call` + `spacetime sql`.
# Covers: user/task lifecycle, clarify, complete + logs, subtasks, project CRUD,
# context assign/remove, trash + delete.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${SPACETIME_TEST_PORT:-3030}"
SERVER="http://127.0.0.1:${PORT}"
DB="gtd-lifecycle-$(date +%s)"
TMP_DIR="$(mktemp -d)"

PASS_COUNT=0

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
    wait "${SERVER_PID}" >/dev/null 2>&1 || true
  fi
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

assert_contains() {
  local haystack="$1"
  local needle="$2"
  local msg="$3"
  if [[ "$haystack" != *"$needle"* ]]; then
    echo "ASSERT FAIL: $msg"
    echo "Expected to find: $needle"
    echo "In output:"
    echo "$haystack"
    exit 1
  fi
  PASS_COUNT=$((PASS_COUNT + 1))
}

assert_not_contains() {
  local haystack="$1"
  local needle="$2"
  local msg="$3"
  if [[ "$haystack" == *"$needle"* ]]; then
    echo "ASSERT FAIL: $msg"
    echo "Did not expect: $needle"
    echo "In output:"
    echo "$haystack"
    exit 1
  fi
  PASS_COUNT=$((PASS_COUNT + 1))
}

sql() {
  spacetime sql "$DB" "$1" --anonymous -s "$SERVER"
}

call() {
  spacetime call "$DB" "$@" --anonymous -s "$SERVER"
}

echo "Starting local SpacetimeDB on $SERVER ..."
spacetime start \
  --listen-addr "127.0.0.1:${PORT}" \
  --in-memory \
  --non-interactive \
  --data-dir "${TMP_DIR}" \
  >"${TMP_DIR}/server.log" 2>&1 &
SERVER_PID=$!
sleep 2

echo "Publishing module ..."
spacetime publish "$DB" -p "$ROOT_DIR" --anonymous --yes -s "$SERVER" >/dev/null

# 1) Create user via SQL.
sql "insert into users (identity, name, createdAt)
     values ((select identity from st_client limit 1), 'Sylvanas', (select 0 where 1=0));" >/dev/null || true

users_out="$(sql "select name from users")"
assert_contains "$users_out" "Sylvanas" "user was created"

# 2) Create project via reducer + verify.
call create_project '"Home"' >/dev/null
projects_out="$(sql "select name from projects")"
assert_contains "$projects_out" "Home" "project create works"

# 3) Update project + verify.
project_id="$(sql "select id from projects where name = 'Home'" | awk 'NR==3 {print $1}')"
call update_project "$project_id" '"Home Ops"' >/dev/null
projects_out="$(sql "select name from projects")"
assert_contains "$projects_out" "Home Ops" "project update works"

# 4) Create context + verify.
call create_context '"@computer"' >/dev/null
contexts_out="$(sql "select name from contexts")"
assert_contains "$contexts_out" "@computer" "context create works"

# 5) Create inbox task via SQL + verify.
sql "insert into tasks (userId, title, notes, status, priority, projectId, dueDate, parentTaskId, createdAt, updatedAt)
     values ((select userId from projects limit 1), 'Plan weekly review', null, 'inbox', 'none', null, null, null,
             (select createdAt from projects limit 1), (select createdAt from projects limit 1));" >/dev/null

tasks_out="$(sql "select title, status from tasks")"
assert_contains "$tasks_out" "Plan weekly review" "task created"
assert_contains "$tasks_out" "inbox" "task starts in inbox"

# 6) Clarify: assign project + priority (SQL), assign context (reducer), add log (reducer).
task_id="$(sql "select id from tasks where title = 'Plan weekly review'" | awk 'NR==3 {print $1}')"
context_id="$(sql "select id from contexts where name = '@computer'" | awk 'NR==3 {print $1}')"
project_id="$(sql "select id from projects where name = 'Home Ops'" | awk 'NR==3 {print $1}')"

sql "update tasks set projectId = ${project_id}, priority = 'high', status = 'next' where id = ${task_id};" >/dev/null
call assign_context_to_task "$task_id" "$context_id" >/dev/null
call append_log "$task_id" '"Clarified task"' >/dev/null

clarified_out="$(sql "select status, priority, projectId from tasks where id = ${task_id}")"
assert_contains "$clarified_out" "next" "task moved to next"
assert_contains "$clarified_out" "high" "priority updated"
assert_contains "$clarified_out" "$project_id" "project linked"

links_out="$(sql "select taskId, contextId from task_contexts where taskId = ${task_id}")"
assert_contains "$links_out" "$context_id" "context assigned"

# 7) Sub-task lifecycle.
sql "insert into tasks (userId, title, notes, status, priority, projectId, dueDate, parentTaskId, createdAt, updatedAt)
     values ((select userId from projects limit 1), 'Draft agenda', null, 'next', 'medium', ${project_id}, null, ${task_id},
             (select updatedAt from tasks where id=${task_id}), (select updatedAt from tasks where id=${task_id}));" >/dev/null

subtask_out="$(sql "select parentTaskId, title from tasks where title = 'Draft agenda'")"
assert_contains "$subtask_out" "$task_id" "sub-task parentTaskId set"

# 8) Complete task via reducer + verify status log.
call set_task_status "$task_id" '"done"' >/dev/null
status_out="$(sql "select status from tasks where id = ${task_id}")"
assert_contains "$status_out" "done" "task completed"

logs_out="$(sql "select message from task_logs where taskId = ${task_id}")"
assert_contains "$logs_out" "Clarified task" "manual log written"
assert_contains "$logs_out" "Status changed from next to done" "status transition log written"

# 9) Context remove + verify.
call remove_context_from_task "$task_id" "$context_id" >/dev/null
links_after_remove="$(sql "select taskId, contextId from task_contexts where taskId = ${task_id}")"
assert_not_contains "$links_after_remove" "$context_id" "context removed"

# 10) Trash + delete lifecycle (soft then hard delete).
call set_task_status "$task_id" '"trash"' >/dev/null
trashed_out="$(sql "select status from tasks where id = ${task_id}")"
assert_contains "$trashed_out" "trash" "task moved to trash"

sql "delete from tasks where id = ${task_id};" >/dev/null
deleted_out="$(sql "select id from tasks where id = ${task_id}")"
assert_not_contains "$deleted_out" "$task_id" "task hard-deleted"

# 11) Project delete + verify cleanup path.
call delete_project "$project_id" >/dev/null
projects_after_delete="$(sql "select id from projects where id = ${project_id}")"
assert_not_contains "$projects_after_delete" "$project_id" "project deleted"

# 12) Context delete + verify.
call delete_context "$context_id" >/dev/null
contexts_after_delete="$(sql "select id from contexts where id = ${context_id}")"
assert_not_contains "$contexts_after_delete" "$context_id" "context deleted"

echo "PASS: ${PASS_COUNT} assertions"
if (( PASS_COUNT < 15 )); then
  echo "ASSERT FAIL: expected at least 15 assertions"
  exit 1
fi
