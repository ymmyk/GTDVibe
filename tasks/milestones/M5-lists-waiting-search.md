# M5 — Lists, Waiting, Search, Home

**Goal:** All remaining screens functional. Full-text search finds items by log content. Filter UI gains an actor dimension (human vs. agent, and which agent). The `search` and `query_items` MCP tools become live.

**Exit criterion:**
1. Search "Dr. Kwan" returns the item whose only mention is in a log entry body.
2. Lists can be filtered to "agent activity in last 24h" and the filter encodes to URL.
3. The `search` and `query_items` MCP tools (registered in M4.5) return non-stub results matching the same shape as the UI.

## Tasks

### Home / Today (`app/page.tsx`)
- [ ] Pinned section: urgent/high priority active items (sorted by priority desc, then updated_at)
- [ ] Inbox count badge → links `/inbox`
- [ ] Waiting count badge → links `/waiting`
- [ ] "Recently updated" feed: items with any log in last 24h, newest activity first
- [ ] Each row navigates to item detail
- [ ] Quick capture bar still present at bottom

### Lists (`app/lists/page.tsx`)
- [ ] Filter chips: area (multi), owner (multi), status (multi), priority (multi), **actor (human / agent / specific agent)**
- [ ] Filters encode to URL query params (shareable, back-button-friendly)
- [ ] Group-by toggle: none / area / owner / status / actor
- [ ] Sort-by toggle: updated / created / priority / due_date
- [ ] Quick-add at top of each group respects group filter (pre-fills area/owner if grouped)
- [ ] Empty state per group
- [ ] Infinite scroll if > 100 items (paginated query)

### Waiting (`app/waiting/page.tsx`)
- [ ] Reactive query `items.waiting()`
- [ ] Each row: title, owner avatar, `waiting_for` text, days waiting badge (red if >14 days, amber if >7)
- [ ] Prominent "Mark unblocked" button per row (no need to navigate into item)
- [ ] Sort by days waiting desc by default

### Search (`app/search/page.tsx`)
- [ ] Convex full-text indexes on `items.title`, `items.body`, `item_logs.body`
- [ ] Query: `search.global(q)` — returns unified results
- [ ] Result card: item title + most relevant snippet (log body if log matched, else item body) + actor attribution on the matched log
- [ ] Snippet highlights match term
- [ ] Filter chips: area, owner, status, date range, actor
- [ ] Keyboard shortcut `/` focuses search from anywhere

### MCP wiring (cuts over from M4.5 stubs)
- [ ] `search` tool returns the same payload as `search.global(q)` with the same filter args
- [ ] `query_items` tool gains the actor filter
- [ ] Output schemas in `packages/shared/src/tools/registry.ts` updated to match real result shape
- [ ] Update `e2e/mcp/agent-leg.spec.ts` to assert the agent can search by log body

### Areas settings (`app/settings/areas/page.tsx`)
- [ ] List household areas
- [ ] Create new area — name + emoji picker + color picker
- [ ] Edit inline
- [ ] Archive area (items are not deleted; tag relations drop or mark area archived and hide)
- [ ] Reorder via drag (optional, nice-to-have)
- [ ] Seed default areas on first login: Home, Kids, Finance, Health, Someday/Maybe

### Convex search setup
- [ ] Schema: add `searchIndex` on items.title, items.body
- [ ] Schema: add `searchIndex` on item_logs.body with `filterField: item_id`
- [ ] Unified query: two search calls, merge + dedupe by item_id, rank by match score

### Tests
- [ ] Playwright: create item, add log with "Dr. Kwan" in body only, search finds it
- [ ] Playwright: filter list by area + owner, verify URL params
- [ ] Playwright: filter list by actor=agent → only items/logs with `actor_kind='agent'`
- [ ] Playwright: waiting view shows correct days_waiting
- [ ] Playwright: home page reactive count badges update across tabs
- [ ] MCP client: `search` tool returns same matches as the UI for the same query
- [ ] MCP client: `query_items` with `actor='agent'` returns only agent-touched items

## Verification
- All 7 screens from the megaprompt exist and work
- Default areas seeded for new household
- Search latency < 200ms for household with 500 items

## Out of scope
- Saved filter presets
- Global keyboard command palette (v2)
- Full calendar view (explicitly out per megaprompt)
- Advanced boolean search operators
