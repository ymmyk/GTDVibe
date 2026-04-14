# GTDVibe — Grand Plan

Shared household GTD app for two parents. Persistent open-loop tracker where nothing disappears until genuinely resolved; every item has an append-only activity log.

## Guiding principles
1. **Capture is sacred** — ≤2 taps/keystrokes from anywhere, title-only acceptable.
2. **Logging is as fast as capture** — always-visible entry field on open items.
3. **Nothing hidden by default** — both parents see everything.
4. **Inbox is a landing zone** — not a place to live.
5. **Waiting items surface** — with age counters.
6. **History is first-class** — logs are the story of how things got done.
7. **No date tyranny** — due dates optional, no nagging.

## Stack decision (overrides the megaprompt)

**Dropped:** SpacetimeDB, React Native/Expo.
**Reason:** SpacetimeDB TS module v2 is young with documented gotchas and near-zero LLM training data. RN adds native friction for a 2-user household app where web-first PWA solves the same problem in a fraction of the time.

| Layer | Pick | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) + React 19 | Highest LLM fluency |
| Styling | Tailwind v4 + shadcn/ui | Zero bikeshedding |
| Backend / DB | **Convex** | Reactive queries, TS end-to-end, server-enforced business logic, built-in auth, realtime subs, scales to zero |
| Auth | Convex Auth (email/password) | Passkeys v2 |
| Hosting | Vercel (web) + Convex cloud | Free tier covers 2 users forever |
| State | Convex reactive queries + TanStack Query where needed | No Redux/Zustand |
| Testing | Vitest (unit), Playwright (E2E demo script) | |
| Monorepo | pnpm workspaces + Turborepo | |
| Task runner | `just` | As specified |
| Mobile later | Expo with same Convex client (or Capacitor PWA wrap) | Only if PWA insufficient after dogfood |

**Fallback if Convex rejected:** Supabase (Postgres + Realtime + RLS). More boilerplate, slightly worse DX.

## Monorepo layout

```
GTDVibe/
├── apps/
│   └── web/              # Next.js 15 PWA
├── packages/
│   ├── convex/           # Convex schema, queries, mutations (the "module")
│   ├── shared/           # Zod schemas, types, state machine (pure fn)
│   └── ui/               # shadcn components + design tokens
├── e2e/                  # Playwright tests (the demo scenario)
├── tasks/
│   └── milestones/       # This directory
├── docs/
├── justfile
├── turbo.json
├── pnpm-workspace.yaml
└── CLAUDE.md
```

## `justfile` interface (required)

```
just bootstrap    # install deps, init Convex, generate types
just dev          # start Convex dev + Next.js dev together
just module-dev   # Convex dev only
just app-dev      # Next.js dev only
just test         # vitest + playwright
just check        # tsc --noEmit across all packages
just ci           # check + test
just generate     # regenerate Convex types
just build        # production build
just seed         # seed demo household (alex + sam)
just e2e          # run Playwright demo scenario
```

## Data model (authoritative)

See `packages/shared/src/schema.ts` once built. Summary:

- **households**: id, name, created_at
- **users**: id, household_id, email, display_name, avatar_url
- **items**: id, household_id, owner_id?, title, body?, status, item_type, priority, due_date?, parent_id?, area_id?, waiting_for?, created_by, timestamps
- **item_logs**: id, item_id, author_id, body, log_type (user|system), created_at
- **areas**: id, household_id, name, emoji?, color?
- **item_tags**: composite (item_id, area_id)

## State machine (single source of truth)

Implemented as a pure function in `packages/shared/src/stateMachine.ts`, imported by both client and server.

```
inbox     → active | archived
active    → waiting (requires waiting_for) | inbox | completed | archived
waiting   → active (auto system log "unblocked")
completed → active (auto system log "re-opened") | archived
archived  → (terminal, soft-delete)
```

Invariants:
- Whitespace-only title → reject
- Empty log body → reject (min 1 char, max 10k)
- Circular parent_id → reject
- parent depth > 5 → reject
- archive with open children → cascade + system log
- reassign to self → no-op, no log
- duplicate area name per household → reject
- last-write-wins on concurrent edits (Convex atomic mutations)

## Milestones

| # | Name | Exit criterion |
|---|---|---|
| M0 | [Foundation](M0-foundation.md) | `just dev` boots; empty homepage; CI green |
| M1 | [Auth + Household](M1-auth-household.md) | Two users in the same household via invite |
| M2 | [Items core domain](M2-items-domain.md) | Full state machine + CRUD, server-enforced, ~40 unit tests green |
| M3 | [Capture + Inbox](M3-capture-inbox.md) | ≤2-tap capture; realtime sync <1s; swipe triage |
| M4 | [Item detail + Log](M4-item-detail.md) | Full item page, inline log stream, sub-items |
| M5 | [Lists, Waiting, Search](M5-lists-waiting-search.md) | All key screens; search finds by log content |
| M6 | [Polish + Demo E2E](M6-polish-demo.md) | 13-step demo scenario green in Playwright |
| M7 | [Ship](M7-ship.md) | Deployed, dogfooded, domain live |

## Ordering rationale

- **M2 before any UI.** The prompt's value is in correct state transitions and edge cases. Get the domain bulletproof headless first; UI becomes a thin shell.
- **Capture (M3) before item detail (M4).** Capture is the sacred path. If capture sucks the app is dead regardless of detail view quality.
- **Search last (M5).** Needs data to be interesting.
- **Demo scripted in Playwright (M6).** Forces hitting every acceptance criterion instead of hand-waving.

## Out of scope (MVP)

- Calendar integration / date-based views
- Notifications / push
- File attachments
- Recurring items / templates
- AI classification
- Kids as users (referenced only, not accounts)
- Private work items (all shared at MVP)
- Multi-household
- Offline-first beyond Convex optimistic updates
- Native apps (PWA first)

## Risks

| Risk | Mitigation |
|---|---|
| Convex learning curve | ~1 day, strong docs, strong LLM support |
| State machine drift UI↔server | Single pure function in `packages/shared`, imported both sides |
| Scope creep on rich text | Plain textarea only at MVP — no markdown rendering, no ProseMirror |
| Demo breaks silently | Playwright covers full 13 steps in CI |
| Subscription fan-out cost | 2 users, free tier, non-concern |

## The demo scenario (locked)

From the megaprompt — this is the Playwright target:

1. Login as Alex (`alex@demo.com`)
2. Quick-capture: "Follow up on Dr. Kwan email"
3. Login as Sam (`sam@demo.com`) in a second browser context
4. Sam sees the item appear in real-time (<1s)
5. Sam clarifies: assigns to Alex, area "Health", priority "medium"
6. Alex sees the assignment
7. Alex logs: "Sent email, waiting on reply"
8. Alex marks waiting, waiting_for: "Dr. Kwan office"
9. Both users see it in Waiting view with days counter
10. Alex marks unblocked → back to active
11. Alex marks complete
12. Item no longer in active views
13. Search "Dr. Kwan" finds item by log history
