# M2 — Items Core Domain

**Goal:** Full CRUD and state machine for items, enforced server-side, covered by unit tests. **No UI yet.** The prompt's entire value is in correct state transitions and edge cases — get this bulletproof headless first.

**Exit criterion:** `just test` runs ~40 unit tests, all green. State machine invariants provably enforced.

## Tasks

### Schema (`packages/convex/schema.ts`)
- [ ] `items` table: household_id, owner_id?, title, body?, status, item_type, priority, due_date?, parent_id?, area_id?, waiting_for?, created_by, created_at, updated_at, completed_at?
- [ ] `item_logs` table: item_id, author_id, body, log_type (user|system), created_at
- [ ] `areas` table: household_id, name, emoji?, color?, archived_at?
- [ ] `item_tags` table: composite (item_id, area_id)
- [ ] Indexes:
  - `items.by_household_and_status`
  - `items.by_household_and_owner`
  - `items.by_parent`
  - `items.by_area`
  - `item_logs.by_item`
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

### Convex mutations (`packages/convex/items.ts`)
- [ ] `createItem({ title, item_type, area_id?, owner_id?, parent_id? })`
  - Validates title non-whitespace
  - Validates parent depth ≤ 5
  - Validates no cycle (parent chain lookup)
  - Defaults: status=`inbox`, priority=`none`, created_by=current user
- [ ] `updateItem(id, patch)`
  - Strict patch schema (Zod `.partial()`)
  - No status mutation via this endpoint — forces `setItemStatus`
- [ ] `setItemStatus(id, newStatus, { waiting_for? })`
  - Validates via state machine
  - Enforces `waiting_for` required on `* → waiting`
  - Auto-creates system log entry describing transition
  - Sets `completed_at` on `* → completed`, clears on `completed → active`
- [ ] `assignItem(id, owner_id | null)`
  - Self-reassign → no-op (return existing, no log)
  - Otherwise: update + system log "Assigned to X"
- [ ] `moveItem(id, new_parent_id | null)`
  - Validates depth ≤ 5 of new subtree
  - Validates no cycle
  - System log "Moved under Y"
- [ ] `archiveItem(id)`
  - If item has open (non-archived) children: cascade archive, system log noting count
  - Single system log at the moved item level
- [ ] `deleteItem(id)` — hard delete, admin only (no-op for MVP, stub)

### Log mutations (`packages/convex/logs.ts`)
- [ ] `addLog(item_id, body)` — validates 1–10k chars, log_type=`user`
- [ ] Internal helper `addSystemLog(item_id, body)` — used by mutations above

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
- [ ] `logs.forItem(item_id)` — chronological
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

## Verification
- `just test` green
- Coverage includes every edge case from the megaprompt

## Out of scope
- Any UI
- Search (M5)
- Optimistic updates (client side, M3+)
