# M6 — Polish + Demo E2E

**Goal:** Ship-quality UX. The locked demo scenario runs green: a 13-step UI leg in Playwright **and** a 5-step agent leg via scripted MCP client.

**Exit criterion:** `just ci` green. `just e2e` runs the UI demo green. `just mcp-e2e` runs the agent demo green. Lighthouse PWA score ≥ 90 across performance, accessibility, best-practices, PWA.

## Tasks

### The demo Playwright test (`e2e/demo-scenario.spec.ts`) — UI leg
- [ ] Two browser contexts (Alex and Sam)
- [ ] Step 1: Alex logs in
- [ ] Step 2: Alex quick-captures "Follow up on Dr. Kwan email"
- [ ] Step 3: Sam logs in in second context
- [ ] Step 4: Assert Sam sees the item in inbox within 1000ms
- [ ] Step 5: Sam swipes to clarify → assigns to Alex, area "Health", priority "medium"
- [ ] Step 6: Assert Alex sees the assignment change within 1000ms
- [ ] Step 7: Alex adds log "Sent email, waiting on reply"
- [ ] Step 8: Alex sets status to waiting with waiting_for "Dr. Kwan office"
- [ ] Step 9: Both users see it in `/waiting` with days_waiting rendered
- [ ] Step 10: Alex marks unblocked → status back to active
- [ ] Step 11: Alex marks complete
- [ ] Step 12: Assert item no longer in active views
- [ ] Step 13: Alex searches "Dr. Kwan" → item found with log snippet

### The demo MCP client test (`e2e/mcp/agent-leg.spec.ts`) — agent leg
- [ ] Reads `alex-claude` token from `.secrets/agent-tokens.json`
- [ ] Spawns the MCP server in stdio (or hits HTTP transport for hosted runs)
- [ ] Step A1: connect, call `tools/list`, assert allowed tools = `query_items, get_item, log_item, search`
- [ ] Step A2: call `query_items({ status: 'waiting' })` → returns the seeded Dr. Kwan item (re-seed it as waiting before the agent leg runs)
- [ ] Step A3: call `log_item({ item_id, body: 'Auto-checked: still waiting on Dr. Kwan' })` → success
- [ ] Step A4: open Alex and Sam in two Playwright contexts → both see the agent log entry within 1000ms with agent badge + "via log_item" subline
- [ ] Step A5: call `archive_item` → server rejects with `ToolNotAllowed`; assert no state mutation on the item; assert the rejection itself is recorded server-side

### Empty states
- [ ] Inbox empty: "Inbox zero"
- [ ] Waiting empty: "Nothing blocked"
- [ ] Lists empty per filter combo
- [ ] Search empty: helpful prompt
- [ ] Home empty: CTA to capture first item
- [ ] One small SVG illustration per empty state (inbox, waiting, search) — see [docs/competitive/ticktick-teardown.md](../../docs/competitive/ticktick-teardown.md) "their visual polish"

### Design tokens (closing the polish gap, see [docs/competitive/ticktick-teardown.md](../../docs/competitive/ticktick-teardown.md))
- [ ] `packages/ui/src/tokens.css`: `--radius: 0.375rem`, single accent color, gray scale carries the work, no rainbow priority chips (use weight + a single accent dot)
- [ ] Inter Variable (or system font stack), body line-height 1.4, heading 1.2
- [ ] Card / row padding 12–16px (override shadcn 24px default)
- [ ] Row hover transition: `background 80ms ease`, no scale/shadow flair
- [ ] One typography scale across the app — audit any one-off font sizes and remove

### Loading & error states
- [ ] Skeleton loaders for every reactive query list
- [ ] Error boundaries per route with "Something went wrong" + retry
- [ ] Offline banner when Convex client disconnected
- [ ] Reconnect cleanly syncs without duplicates (verify in Playwright with network throttling)

### Accessibility pass
- [ ] Keyboard nav works on every screen (tab order + focus rings)
- [ ] ARIA labels on icon-only buttons
- [ ] Color contrast ≥ AA (verified via Lighthouse + axe)
- [ ] `prefers-reduced-motion` respected
- [ ] Screen reader announces log updates (aria-live on log stream)

### Mobile responsive
- [ ] 320px minimum width
- [ ] Bottom nav bar on mobile: Home / Inbox / Waiting / Search / Settings
- [ ] Touch targets ≥ 44px
- [ ] Swipe gestures work on touch (tested in Playwright mobile viewport)

### PWA
- [ ] `manifest.webmanifest` with full icon set (192, 512, maskable)
- [ ] Service worker via `next-pwa` or custom — cache shell, network-first for data
- [ ] Installable on iOS Safari and Android Chrome
- [ ] Share target intent for Android: receive shared text → pre-fill capture bar
- [ ] Offline: cached shell loads even when disconnected (data view shows stale + banner)
- [ ] **Tray-style global capture** (TickTick parity, see [docs/competitive/ticktick-teardown.md](../../docs/competitive/ticktick-teardown.md) #4): installed PWA registers `Ctrl+Shift+Space` (or platform equivalent) via Launch Handler API + Window Controls Overlay where supported; opens a minimal capture window even when the main app is backgrounded. Graceful fallback: same shortcut works in-app only on browsers that don't support the API. A native shell wrapper is explicitly out of scope.

### Demo seed data
- [ ] `just seed` creates a rich demo household:
  - Bathroom Remodel project with 3 sub-items, 5 logs
  - Emma's College Plan with 10 logs
  - Easter dinner checklist
  - Jonas's soccer registration (waiting)
  - "Follow up on Dr. Kwan email" (inbox) — required for the E2E
  - `alex-claude` and `sam-claude` agents with tokens in `.secrets/agent-tokens.json`
  - At least one historical agent log entry on the Bathroom Remodel project so screenshots show mixed-actor history out of the box

### CI
- [ ] GitHub Action runs `just ci` (unit + typecheck + tool-parity check)
- [ ] Separate Playwright job runs `just e2e` against ephemeral Convex preview deployment
- [ ] Separate job runs `just mcp-e2e` against the same preview deployment (after seed)
- [ ] Lighthouse CI as a post-deploy check

## Verification
- `just ci` → green (incl. tool-parity check)
- `just e2e` → 13-step UI demo passes
- `just mcp-e2e` → 5-step agent demo passes
- Lighthouse all ≥ 90
- Manual test on real iPhone + Android via local network
- Manual test: Claude Desktop configured with `alex-claude` token can list tools, query waiting items, append a log; Sam sees the log appear in real time with agent attribution

## Out of scope
- Push notifications (v2)
- Analytics (v2)
- Crash reporting (Sentry in v2)
