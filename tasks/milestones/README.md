# GTDVibe — Grand Plan

**Thesis:** the future of personal/household productivity software is a GUI cockpit + AI agents acting on the user's behalf via MCP and API. GTDVibe is built ground-up for that world.

Shared household GTD workspace for two parents **and the agents working for them**. Persistent open-loop tracker where nothing disappears until genuinely resolved; every item has an append-only activity log that doubles as the agent audit trail. The Next.js PWA is the cockpit; the MCP server is a co-equal product surface.

## Guiding principles
1. **Capture is sacred** — ≤2 taps/keystrokes from a human, ≤1 tool call from an agent.
2. **Logging is as fast as capture** — always-visible entry field on open items; agents log automatically on every mutation.
3. **Nothing hidden by default** — both parents see everything; every agent action shows up in the same shared view, attributed to the agent.
4. **Inbox is a landing zone** — not a place to live.
5. **Waiting items surface** — with age counters.
6. **History is first-class** — logs are the story of how things got done **and who did it (human or agent)**.
7. **No date tyranny** — due dates optional, no nagging.
8. **GUI ↔ MCP parity** — every state change is reachable from both surfaces, enforced by the same shared rules. No private mutations.
9. **Agents are scoped principals** — capability tokens, no impersonation, never cross-household.

## Stack decision (overrides the megaprompt)

**Dropped:** SpacetimeDB, React Native/Expo.
**Reason:** SpacetimeDB TS module v2 is young with documented gotchas and near-zero LLM training data. RN adds native friction for a 2-user household app where web-first PWA solves the same problem in a fraction of the time.

| Layer | Pick | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) + React 19 | Highest LLM fluency |
| Styling | Tailwind v4 + shadcn/ui | Zero bikeshedding |
| Backend / DB | **Convex** | Reactive queries, TS end-to-end, server-enforced business logic, built-in auth, realtime subs, scales to zero |
| Auth (humans) | Convex Auth (email/password, passkeys v2) | |
| Auth (agents) | Capability tokens bound to (household, principal, allowed tools) | Scoped, revocable, no human impersonation |
| **Agent surface** | **MCP server (`@modelcontextprotocol/sdk`)** wrapping the same Convex actions the UI uses | GUI/MCP parity, single source of truth |
| Hosting | Vercel (web + MCP HTTP transport) + Convex cloud | Free tier covers 2 users forever |
| State | Convex reactive queries + TanStack Query where needed | No Redux/Zustand |
| Testing | Vitest (unit), Playwright (UI E2E), scripted MCP client (agent E2E) | |
| Monorepo | pnpm workspaces + Turborepo | |
| Task runner | `just` | As specified |
| Mobile later | Expo with same Convex client (or Capacitor PWA wrap) | Only if PWA insufficient after dogfood |

**Fallback if Convex rejected:** Supabase (Postgres + Realtime + RLS). More boilerplate, slightly worse DX.

## Monorepo layout

```
GTDVibe/
├── apps/
│   ├── web/              # Next.js 15 PWA — the human cockpit
│   └── mcp/              # MCP server — the agent surface (stdio + HTTP transports)
├── packages/
│   ├── convex/           # Convex schema, queries, mutations (the "module")
│   ├── shared/           # Zod schemas, types, state machine, tool contracts (pure fns)
│   └── ui/               # shadcn components + design tokens
├── e2e/                  # Playwright (UI demo) + MCP client tests (agent demo)
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
just dev          # start Convex + Next.js + MCP server together
just module-dev   # Convex dev only
just app-dev      # Next.js dev only
just mcp-dev      # MCP server (stdio) for local agent testing
just test         # vitest + playwright + mcp client tests
just check        # tsc --noEmit across all packages
just ci           # check + test
just generate     # regenerate Convex types
just build        # production build
just seed         # seed demo household (alex + sam) + demo agent identity & token
just e2e          # Playwright UI demo
just mcp-e2e      # scripted-agent run through the MCP demo leg
```

## Data model (authoritative)

See `packages/shared/src/schema.ts` once built. Summary:

- **households**: id, name, created_at
- **users**: id, household_id, email, display_name, avatar_url
- **agents**: id, household_id, principal_user_id, display_name, kind (e.g. `claude`, `openhands`, `custom`), created_at, revoked_at?
- **agent_tokens**: id, agent_id, token_hash, allowed_tools (string[]), expires_at?, created_at, revoked_at?
- **items**: id, household_id, owner_id?, title, body?, status, item_type, priority, due_date?, parent_id?, area_id?, waiting_for?, created_by_kind (`human`|`agent`), created_by_id, timestamps
- **item_logs**: id, item_id, actor_kind (`human`|`agent`), actor_id, body, log_type (`user`|`system`|`agent`), tool_name?, created_at
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
| M0 | [Foundation](M0-foundation.md) | `just dev` boots web + Convex + MCP stub; empty homepage; CI green |
| M1 | [Auth + Household](M1-auth-household.md) | Two users in the same household via invite; agent identity + capability-token model in schema |
| M2 | [Items core domain](M2-items-domain.md) | Full state machine + CRUD, server-enforced, `actor_kind` on every mutation/log, ~40 unit tests green |
| M3 | [Capture + Inbox](M3-capture-inbox.md) | ≤2-tap capture; realtime sync <1s; swipe triage |
| M4 | [Item detail + Log](M4-item-detail.md) | Full item page, inline log stream, sub-items, agent actions visibly attributed |
| M4.5 | [MCP surface](M4.5-mcp-surface.md) | MCP server exposes `capture_item`, `transition_item`, `log_item`, `query_items`, `search` — same Convex actions as the UI; capability-token auth; Claude Desktop / scripted-client smoke green |
| M5 | [Lists, Waiting, Search](M5-lists-waiting-search.md) | All key screens; search finds by log content; filter by actor (human/agent) |
| M6 | [Polish + Demo E2E](M6-polish-demo.md) | Demo scenario green in Playwright **and** the MCP agent leg green via scripted client |
| M7 | [Ship](M7-ship.md) | Deployed, dogfooded, domain live, MCP endpoint published |

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
- **In-app LLM calls / built-in classification** — intelligence lives in external agents talking via MCP
- **Agent-to-agent orchestration inside GTDVibe** — GTDVibe is shared state, not an orchestrator
- **Arbitrary code/shell tools over MCP** — tool surface is GTD domain only
- Kids as users (referenced only, not accounts)
- Private work items (all shared at MVP)
- Multi-household
- Offline-first beyond Convex optimistic updates
- Native apps (PWA first)

## Risks

| Risk | Mitigation |
|---|---|
| Convex learning curve | ~1 day, strong docs, strong LLM support |
| State machine drift UI↔server↔MCP | Single pure function + tool contracts in `packages/shared`, imported by all three |
| GUI/MCP parity drift | Each new mutation must ship with an MCP tool wrapper; CI check that every `mutation` in `packages/convex` has a registered tool in `apps/mcp` |
| Agent does something destructive | Capability tokens scoped to allowed-tool sets; archive/cascade requires explicit token grant; append-only log gives a full audit trail |
| Prompt-injection via item content | Server enforces all rules — agents can only call declared tools with validated Zod inputs; item bodies are never executed |
| Scope creep on rich text | Plain textarea only at MVP — no markdown rendering, no ProseMirror |
| Demo breaks silently | Playwright covers UI demo; scripted MCP client covers agent demo; both in CI |
| Subscription fan-out cost | 2 users + a few agents, free tier, non-concern |

## The demo scenario (locked)

Two-part demo: a UI leg (Playwright) and an agent leg (scripted MCP client). Both must be green in CI.

**UI leg (Playwright):**

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

**Agent leg (scripted MCP client, runs after the UI leg seeds data):**

A1. Agent `alex-claude` connects to the MCP server with Alex's capability token
A2. Agent calls `query_items` filtered by `status=waiting` — sees the Dr. Kwan item
A3. Agent calls `log_item` adding "Auto-checked: still waiting on Dr. Kwan"
A4. Both Alex and Sam see the log entry attributed to the agent (badge + name) in real time
A5. Agent attempts a tool not in its allowed set (e.g. `archive_item`) → server rejects with a clear error; no state change; rejection recorded
