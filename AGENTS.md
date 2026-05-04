# GTDVibe Agent Instructions

Build GTDVibe as a **human + AI-agent shared GTD workspace**. Primary humans are a two-parent household; primary non-humans are autonomous agents (Claude/OpenHands/Computer-Use class) acting on their behalf via MCP and API. Fast capture, shared visibility, durable open-loop tracking, and an append-only history that doubles as an **agent audit trail**.

The GUI is the cockpit. The MCP/API surface is co-equal: anything a human can do in the UI, an agent can do via MCP, gated by the same server-enforced rules.

## Start Every Session With These Reads

Read these in order before making non-trivial changes:
1. [tasks/milestones/README.md](tasks/milestones/README.md)
2. The milestone file(s) for the work you are doing in [tasks/milestones](tasks/milestones)
3. [AGENTS.md](AGENTS.md)
4. Relevant concept docs in [docs/concepts](docs/concepts) only if you need background on product direction or tradeoffs

## Source Hierarchy

When sources conflict, use this order:
1. The user's explicit request
2. [tasks/milestones/README.md](tasks/milestones/README.md)
3. The relevant milestone file in [tasks/milestones](tasks/milestones)
4. This file
5. [docs/concepts/scoring-matrix.md](docs/concepts/scoring-matrix.md) and the individual concept docs

Concept docs are ideation inputs, not implementation specs. Do not quietly pull in extra features from them once the milestone plan has made a narrower MVP choice.

## Product Mission

GTDVibe is a web-first PWA cockpit for a two-parent household, with a co-equal MCP/API surface for AI agents acting on the household's behalf.

The MVP exists to make these things true:
1. Capture is sacred: a title-only item can be saved in 2 taps/keystrokes — or one MCP tool call.
2. Logging is as fast as capture: open items always make it easy to append context, whether the actor is a human or an agent.
3. Nothing disappears silently: both parents see the same household state by default, and every agent action lands in the same shared view.
4. Inbox is a landing zone, not a long-term home.
5. Waiting items stay visible and age visibly.
6. History is first-class: logs are the story of how the work moved, and the audit trail for what agents did.
7. Due dates are optional. Avoid date tyranny and nag-heavy UX.
8. **GUI ↔ MCP parity:** every state transition is reachable both ways, enforced by the same shared rules. The MCP server is the product, not an afterthought.
9. **Agents are first-class principals:** every mutation records an `actor` (human user or named agent identity) and a reason. Agents act under scoped capability tokens, never as a human.

## Product Non-Negotiables

1. The authoritative item lifecycle is the state machine in `packages/shared/src/stateMachine.ts` once it exists. It is invoked by Convex mutations **and** by the MCP tool layer — never bypassed.
2. Server-side rules are the source of truth. UI affordances and MCP tool descriptions may guide transitions, but the backend must enforce them identically for both surfaces.
3. Item history is append-only. Do not add log editing or silent mutation of past activity. Every log entry records `actor_kind` (`human` | `agent`) and `actor_id`.
4. Household visibility is shared by default for MVP. No private items, role tiers, or multi-household scope unless the user explicitly changes the plan. Agents inherit the visibility scope of the principal that authorized them.
5. `waiting` requires meaningful `waiting_for` text.
6. Illegal state transitions must be impossible, not merely discouraged — for both UI and MCP callers.
7. Search must include log body matches, not just item titles.
8. The Alex/Sam demo household is a first-class fixture. Preserve seeded demo accounts and the demo scenario unless the user asks to change them.
9. The demo scenario in [tasks/milestones/README.md](tasks/milestones/README.md) is locked. Treat it as a product contract and regression suite. It now includes an agent-driven leg (capture or log via MCP) once the MCP surface lands.
10. MVP remains web-first PWA + MCP server. Do not reintroduce React Native, Expo, SpacetimeDB, or native-only flows unless the user explicitly reopens those decisions.
11. **GUI/MCP parity is non-negotiable.** New mutations must ship with a corresponding MCP tool, or land behind a feature flag until the MCP tool exists. No private mutations.
12. **Agent capability tokens are scoped:** agents authenticate with tokens bound to (household, principal, allowed tool set, optional item scope). Tokens never grant cross-household access.

## Implementation Priorities

1. Follow milestone order `M0 -> M7` unless the user explicitly asks to jump.
2. Respect the ordering rationale in the grand plan:
   - M2 domain correctness before richer UI
   - M3 capture before M4 detail
   - M5 search after enough data shape exists
   - M6 Playwright demo before calling the product polished
3. When implementation files described in the milestone plan do not exist yet, create the target structure from the plan instead of inventing a different layout.
4. Default repository shape is the one defined in the grand plan:
   - `apps/web`
   - `apps/mcp` — MCP server exposing GTDVibe tools (capture, transition, log, query, search) to agents
   - `packages/convex`
   - `packages/shared` — schemas, state machine, **and the agent-facing tool contracts** consumed by both web and MCP
   - `packages/ui`
   - `e2e`
   - `justfile`

## Stack And Architecture Rules

1. Default stack is Next.js 15 App Router + React 19 + Tailwind v4 + shadcn/ui + Convex + Convex Auth + **`@modelcontextprotocol/sdk` for the MCP server** + Vitest + Playwright + pnpm workspaces + Turborepo.
2. Use `just` as the human-facing task interface. If an expected workflow is missing, add it to `justfile` instead of documenting ad hoc shell commands as the canonical path.
3. Keep business rules in shared, testable code where possible:
   - schemas and validation in `packages/shared`
   - lifecycle rules in `packages/shared`
   - **tool contracts (Zod input/output schemas + descriptions) in `packages/shared`** — consumed verbatim by Convex mutations and the MCP server
   - enforcement in Convex mutations and queries
   - UI and MCP server are both thin clients over those rules
4. Prefer deterministic, auditable behavior over smart-but-opaque behavior. The MCP server is a transport, not a place for clever logic.
5. Keep the product simple:
   - plain text notes
   - append-only logs (with `actor_kind` + `actor_id` on every entry)
   - no rich text editor
   - no in-app LLM calls in MVP — agents live outside the system and call in via MCP/API
6. Agent identity model:
   - Each agent identity is a row tied to a principal (human user) in a household
   - Auth via opaque capability tokens with explicit allowed-tool sets
   - All agent mutations write `actor_kind = "agent"` to logs — never impersonate the human

## Execution Discipline

Default to plan-first for non-trivial work.

At the start of each task, assign a T-shirt size:
- `XS`: tiny doc or single-file tweak
- `S`: small localized change
- `M`: multi-file change or any change needing careful coordination
- `L`: broad feature slice spanning packages
- `XL`: milestone-scale or architecture-shaping work

Rules:
1. `XS` and `S` work can proceed after a brief inline plan.
2. `M`, `L`, and `XL` work should start with a task note at `tasks/YYYY-MM-DD/<slug>.md`.
3. Do not create new planning files inside `tasks/milestones/` unless the user is explicitly updating the milestone plan itself.
4. Explicit confirmation is required before destructive, security-sensitive, or architecture-reversing changes.
5. Fix root causes. Avoid temporary patches unless the user explicitly wants a stopgap.
6. Keep changes minimal and scoped to the active milestone or request.

Each `M+` task note should include:
1. Verdict
2. Scope in
3. Scope out
4. Assumptions
5. Risks
6. Validation plan
7. Checklist
8. Decision log

## Testing And Completion Bar

Work is not done until the milestone's exit criterion is actually checked, or you explain exactly what prevented verification.

Validation rules:
1. Run the smallest meaningful checks during iteration, then the milestone-level checks before finishing.
2. For domain work, prioritize unit coverage of invariants and edge cases.
3. For UX flows, prefer Playwright over hand-wavy manual claims.
4. For cross-browser or realtime behavior, test the actual multi-context flow when the milestone requires it.
5. Do not claim success on "should work." Use command output, test results, or a clearly described blocker.

Minimum expected command surface:
- `just bootstrap`
- `just dev` — starts Convex + web + MCP together
- `just module-dev`
- `just app-dev`
- `just mcp-dev` — runs the MCP server in stdio mode for local agent testing
- `just test`
- `just check`
- `just ci`
- `just generate`
- `just build`
- `just seed` — seeds demo household and at least one demo agent identity + token
- `just e2e`
- `just mcp-e2e` — runs an agent (Claude/scripted) through the MCP demo leg

If one of these commands is not implemented yet, add the missing path or leave a clearly marked placeholder that fails loudly on critical gaps.

## Documentation Update Rules

Update docs when contracts change.

Typical cases:
1. Update [tasks/milestones/README.md](tasks/milestones/README.md) when stack, architecture, milestone ordering, or acceptance criteria materially change.
2. Update the affected milestone file when its task list or exit criterion changes.
3. Update [AGENTS.md](AGENTS.md) when repository-wide operating rules change.
4. Update setup docs like `README.md`, `CLAUDE.md`, or `justfile` comments when commands or developer workflows change.

## Scope Guardrails

Unless the user explicitly says otherwise, keep the MVP out of these areas:
1. Native apps
2. Notifications and push
3. File attachments
4. Recurring items and templates
5. **In-app LLM calls / built-in AI classification.** Intelligence lives in external agents that connect via MCP — the app exposes tools, it does not host models.
6. Private work items
7. Multi-household support
8. Calendar-heavy scheduling views
9. App-store packaging
10. Agent-to-agent orchestration inside GTDVibe (agents coordinate externally; GTDVibe is the shared state, not the orchestrator)
11. Arbitrary code execution / shell tools over MCP — tool surface is restricted to GTD domain operations

## Communication Contract

Assume the user wants high-signal collaboration:
1. Lead with the answer or recommendation.
2. Be concise and concrete.
3. Surface weak assumptions, hidden risks, and scope creep early.
4. Prefer specifics, examples, diffs, and acceptance criteria over abstractions.
5. Ask at most one precise blocking question when necessary.

## Practical Repo Notes

1. This repository is currently planning-heavy. Expect to create the implementation structure defined in the milestone plan rather than discovering a mature codebase.
2. The current product direction is not "all five concepts at once." `FlowCapture` scored highest, but the chosen MVP is the milestone plan's specific blend of fast capture, shared household coordination, waiting visibility, and append-only history.
3. Use the seeded household and canonical examples from the plan for development and tests:
   - `alex@demo.com`
   - `sam@demo.com`
   - household: `The Demo Family`
   - canonical item: `Follow up on Dr. Kwan email`

When in doubt, narrow scope, preserve the milestone contract, and ship the smallest complete vertical slice that keeps the locked demo getting greener.
