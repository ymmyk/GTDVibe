# M2 — Items Core Domain

**Goal:** Full CRUD and state machine for items, enforced server-side, covered by unit tests. **No UI yet.** The prompt's entire value is in correct state transitions and edge cases — get this bulletproof headless first. Every mutation accepts an `Actor` and every write records `actor_kind` so M4.5 can plug agents in without schema churn.

**Exit criterion:** `just test` runs ~45 unit tests, all green. State machine invariants provably enforced. Every mutation rejects when called with no actor; every log entry carries `actor_kind` + `actor_id`.

## Tasks

### Schema (`packages/convex/schema.ts`)
- [ ] `items` table: household_id, owner_id?, title, body?, status, item_type, priority, due_date?, parent_id?, area_id?, waiting_for?, **created_by_kind** (`human`|`agent`), **created_by_id**, created_at, updated_at, completed_at?
- [ ] `item_logs` table: item_id, **actor_kind** (`human`|`agent`), **actor_id**, body, log_type (`user`|`system`|`agent`), tool_name?, created_at
- [ ] `areas` table: household_id, name, emoji?, color?, archived_at?
- [ ] `item_tags` table: composite (item_id, area_id)
- [ ] Indexes:
  - `items.by_household_and_status`
  - `items.by_household_and_owner`
  - `items.by_parent`
  - `items.by_area`
  - `item_logs.by_item`
  - `item_logs.by_actor` (for "filter by actor" in M5)
  - `areas.by_household`
  - Unique `areas.name_per_household`

### State machine (`packages/shared/src/stateMachine.ts`)
- [ ] Pure function `canTransition(from: Status, to: Status): boolean`
- [ ] Pure function `requireWaitingFor(from, to): boolean`
- [ ] Exhaustive transition map from the grand plan
- [ ] Exported constants: `STATUSES`, `ITEM_TYPES`, `PRIORITIES`
- [ ] Unit tests for every legal transition + every illegal transition rejected

### Zod schemas (`packages/shared/src/schema.ts`)
- [ ] `ItemSchema`, `LogSchema`, `AreaSchema` with full validation:
  - Title: non-empty after trim, max 500 chars
  - Log body: 1–10,000 chars
  - Area name: 1–100 chars
  - `waiting_for`: required and non-empty when status transitions to `waiting`

### Actor resolution
- [ ] Internal helper `resolveActor(ctx)` — Convex Auth identity → `{ kind: 'human', id: userId, ... }` or null
- [ ] Internal helper `resolveActorFromAgent(agentId)` — used when an MCP-bound mutation is invoked via agent token (wired up in M4.5; live now so signatures are stable)
- [ ] All mutations below take `actor: Actor` internally and reject if unresolved
- [ ] System logs use a synthetic `actor = { kind: 'human', id: actor.id }` (the human who triggered the cascade) rather than a fake "system" actor — `log_type=system` already disambiguates

### Convex mutations (`packages/convex/items.ts`)
- [ ] `createItem({ title, item_type, area_id?, owner_id?, parent_id? })`
  - Validates title non-whitespace
  - Validates parent depth ≤ 5
  - Validates no cycle (parent chain lookup)
  - Defaults: status=`inbox`, priority=`none`, `created_by_kind` and `created_by_id` from resolved actor
  - Writes initial `log_type=system` "Created" log carrying actor
- [ ] `updateItem(id, patch)`
  - Strict patch schema (Zod `.partial()`)
  - No status mutation via this endpoint — forces `setItemStatus`
- [ ] `setItemStatus(id, newStatus, { waiting_for? })`
  - Validates via state machine
  - Enforces `waiting_for` required on `* → waiting`
  - Auto-creates system log entry describing transition (with actor)
  - Sets `completed_at` on `* → completed`, clears on `completed → active`
- [ ] `assignItem(id, owner_id | null)`
  - Self-reassign → no-op (return existing, no log)
  - Otherwise: update + system log "Assigned to X" with actor
- [ ] `moveItem(id, new_parent_id | null)`
  - Validates depth ≤ 5 of new subtree
  - Validates no cycle
  - System log "Moved under Y" with actor
- [ ] `archiveItem(id)`
  - If item has open (non-archived) children: cascade archive, system log noting count
  - Single system log at the moved item level, with actor
- [ ] `deleteItem(id)` — hard delete, admin only (no-op for MVP, stub)

### Log mutations (`packages/convex/logs.ts`)
- [ ] `addLog(item_id, body)` — validates 1–10k chars; `log_type` is `user` if actor is human, `agent` if actor is agent; carries `actor_kind`+`actor_id`+(optional)`tool_name`
- [ ] Internal helper `addSystemLog(item_id, body, actor)` — used by mutations above

### Area mutations (`packages/convex/areas.ts`)
- [ ] `createArea({ name, emoji?, color? })` — rejects duplicate name per household
- [ ] `updateArea(id, patch)` — same duplicate check
- [ ] `archiveArea(id)`

### Queries (reactive)
- [ ] `items.listByStatus(status)`
- [ ] `items.listByArea(area_id)`
- [ ] `items.byId(id)` — returns item + children count + completed children count
- [ ] `items.inbox()` — newest first
- [ ] `items.waiting()` — with computed `days_waiting`
- [ ] `items.recentlyUpdated(hours=24)`
- [ ] `logs.forItem(item_id)` — chronological, includes `actor_kind` + resolved actor display name (human or agent)
- [ ] `areas.list()`

### Unit tests (Vitest, against `convex-test`)
- [ ] State machine: legal and illegal transitions (covered in shared package tests)
- [ ] `createItem`: whitespace-only title rejected
- [ ] `createItem`: parent depth > 5 rejected
- [ ] `createItem`: cycle rejected
- [ ] `setItemStatus`: `active → waiting` without `waiting_for` rejected
- [ ] `setItemStatus`: `inbox → completed` rejected (illegal)
- [ ] `setItemStatus`: `waiting → active` produces system log "unblocked"
- [ ] `setItemStatus`: `completed → active` produces system log "re-opened", clears `completed_at`
- [ ] `assignItem`: self-assign is no-op, no log
- [ ] `assignItem`: reassign creates system log
- [ ] `addLog`: empty body rejected
- [ ] `addLog`: 10,001 chars rejected
- [ ] `archiveItem`: cascades to open children, all archived, cascade logged
- [ ] `moveItem`: cycle rejected
- [ ] `moveItem`: depth > 5 rejected
- [ ] `createArea`: duplicate name per household rejected
- [ ] Cross-household isolation: user from household A cannot read/write household B's items
- [ ] **Actor**: `addLog` invoked with an agent actor writes `log_type='agent'`, `actor_kind='agent'`, and the agent's id
- [ ] **Actor**: `createItem` invoked with an agent actor records `created_by_kind='agent'`
- [ ] **Actor**: mutation invoked with no resolvable actor is rejected with a clear error
- [ ] **Actor**: agent actor in household A cannot mutate items in household B

## Verification
- `just test` green
- Coverage includes every edge case from the megaprompt

## Out of scope
- Any UI
- Any MCP tool wiring (M4.5)
- Search (M5)
- Optimistic updates (client side, M3+)
