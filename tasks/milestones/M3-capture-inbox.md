# M3 — Capture + Inbox

**Goal:** The sacred path works in the GUI. ≤2-tap capture from anywhere. Inbox triage via swipe. Realtime sync between two browsers in <1s. The same `createItem` mutation will be exposed as an MCP `capture_item` tool in M4.5 — keep the mutation signature stable.

**Exit criterion:** Playwright test — Alex captures "Follow up on Dr. Kwan email", Sam sees it in <1s, Sam swipes to clarify and assigns to Alex.

## Tasks

### Quick Capture Bar
- [ ] `components/QuickCaptureBar.tsx` — pinned bottom on every authed screen
- [ ] Keyboard: `c` from anywhere focuses input, `Enter` creates item, `Esc` blurs
- [ ] Mobile: collapsed FAB → tap expands sheet with autofocused title
- [ ] Optimistic insert via Convex mutation
- [ ] Visible "Added to inbox" toast with 3s undo (calls `archiveItem`)
- [ ] Title-only — no metadata required
- [ ] Injected into root authed layout so it's present on every page

### Inbox screen (`/inbox`)
- [ ] Lists items where status=`inbox`, newest first
- [ ] Each row: title, `created_at` relative time, author avatar/badge — render an "agent" badge with agent name when `created_by_kind='agent'` (so users can spot agent captures even before the full M4 attribution UI)
- [ ] Swipe right → open clarify sheet
- [ ] Swipe left → archive (with undo toast)
- [ ] Tap → navigate to item detail (stub ok; real detail in M4)
- [ ] Empty state: "Inbox zero ✓" (the only emoji allowed in MVP)
- [ ] Badge count in header + home link

### Clarify sheet
- [ ] Bottom sheet component (Vaul or shadcn Drawer)
- [ ] Fields: area picker, owner picker, priority segmented control
- [ ] All optional
- [ ] "Save to active" CTA → calls `setItemStatus(id, 'active')` + `updateItem` + `assignItem` as needed
- [ ] Keyboard: `Enter` confirms, `Esc` cancels

### Realtime verification
- [ ] Home page shows inbox count badge via reactive query
- [ ] Manual test: open two browser contexts, capture in one, verify second updates without refresh
- [ ] Record actual latency in dev tools — must be <1s

### Convex client setup
- [ ] `ConvexReactClient` wired with optimistic updates for `createItem`, `archiveItem`
- [ ] Loading skeletons for reactive queries (use shadcn Skeleton)

### Gestures
- [ ] `@use-gesture/react` or Framer Motion drag for row swipes
- [ ] Reduced-motion fallback: action buttons revealed via row tap

### Tests
- [ ] Playwright: capture → appears in inbox → swipe right → clarify sheet → save → item leaves inbox
- [ ] Playwright: capture → swipe left → archived → undo restores
- [ ] Playwright: two contexts, Alex captures, Sam sees within 1s
- [ ] Vitest: component test for QuickCaptureBar keyboard shortcuts
- [ ] Vitest: component test for clarify sheet validates "no-op on unchanged save"

## Verification
- The three Playwright tests above pass
- Lighthouse on `/inbox` ≥ 90 performance
- Capture works with keyboard only (no mouse needed)

## Out of scope
- Item detail page (M4)
- Activity log UI (M4)
- Sub-items (M4)
- MCP tools (M4.5)
- Search (M5)
