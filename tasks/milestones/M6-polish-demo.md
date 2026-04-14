# M6 — Polish + Demo E2E

**Goal:** Ship-quality UX. The exact 13-step demo scenario from the megaprompt runs green in Playwright.

**Exit criterion:** `just ci` green. `just e2e` runs full demo scenario green. Lighthouse PWA score ≥ 90 across performance, accessibility, best-practices, PWA.

## Tasks

### The demo Playwright test (`e2e/demo-scenario.spec.ts`)
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

### Empty states
- [ ] Inbox empty: "Inbox zero"
- [ ] Waiting empty: "Nothing blocked"
- [ ] Lists empty per filter combo
- [ ] Search empty: helpful prompt
- [ ] Home empty: CTA to capture first item

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

### Demo seed data
- [ ] `just seed` creates a rich demo household:
  - Bathroom Remodel project with 3 sub-items, 5 logs
  - Emma's College Plan with 10 logs
  - Easter dinner checklist
  - Jonas's soccer registration (waiting)
  - "Follow up on Dr. Kwan email" (inbox) — required for the E2E

### CI
- [ ] GitHub Action runs `just ci` (unit + typecheck)
- [ ] Separate Playwright job runs `just e2e` against ephemeral Convex preview deployment
- [ ] Lighthouse CI as a post-deploy check

## Verification
- `just ci` → green
- `just e2e` → the 13-step demo passes
- Lighthouse all ≥ 90
- Manual test on real iPhone + Android via local network

## Out of scope
- Push notifications (v2)
- Analytics (v2)
- Crash reporting (Sentry in v2)
