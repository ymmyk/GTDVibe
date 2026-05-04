# M0 — Foundation

**Goal:** Scaffolding only, no features. Prove the toolchain works end to end **for both surfaces** — web cockpit and MCP server.

**Exit criterion:** Fresh clone → `just bootstrap && just dev` boots Next.js + Convex + MCP stub in ≤3 min. Empty homepage renders. MCP stub responds to `tools/list` (returns one ping tool). `just ci` green.

## Tasks

### Repo & monorepo
- [ ] pnpm workspace: `pnpm-workspace.yaml` with `apps/*` and `packages/*`
- [ ] Turborepo: `turbo.json` with `dev`, `build`, `check`, `test` pipelines
- [ ] Root `package.json` with workspace scripts delegating to `just`
- [ ] `.nvmrc` pinned to Node 20 LTS
- [ ] `.gitignore` covers `.next`, `node_modules`, `.convex`, `.turbo`

### justfile
- [ ] Implement all commands from the grand plan `justfile` section
- [ ] `just dev` runs Convex + Next.js + MCP server concurrently (use `concurrently` or `just` parallel)
- [ ] `just mcp-dev` runs the MCP server alone in stdio mode
- [ ] `just mcp-e2e` placeholder that fails loudly until M4.5

### Next.js app (`apps/web`)
- [ ] `create-next-app` — App Router, TypeScript, Tailwind v4, no ESLint default (we'll add biome)
- [ ] Install shadcn/ui with `new-york` style, dark mode via `next-themes`
- [ ] Root layout: header with app name, theme toggle, empty main area
- [ ] `app/page.tsx`: "GTDVibe — M0" placeholder
- [ ] PWA manifest stub (icons + name, full PWA in M6)

### Convex (`packages/convex`)
- [ ] `npx convex dev` scaffolded inside `packages/convex`
- [ ] Empty schema file
- [ ] Wire Convex client into `apps/web` via `ConvexProvider`
- [ ] `.env.local.example` documenting required env vars (web Convex URL **and** MCP server's Convex URL + agent-token signing secret placeholders)

### MCP server (`apps/mcp`)
- [ ] TypeScript app using `@modelcontextprotocol/sdk` server
- [ ] stdio transport for local agents; HTTP+SSE transport stub for hosted use (full HTTP auth lands in M4.5)
- [ ] Single registered tool `ping` returning `{ ok: true, version }` — proves wiring
- [ ] Imports the (empty) `packages/shared` so the dependency graph is established
- [ ] Convex HTTP client placeholder — does not call Convex yet
- [ ] Connects to a configured Convex deployment via env var, no auth yet

### Shared package (`packages/shared`)
- [ ] TypeScript project with `tsconfig.json` extending root
- [ ] Empty exports for `schema`, `stateMachine`, `types`, `tools` (tool-contract registry consumed by both Convex and MCP)
- [ ] Zod installed

### UI package (`packages/ui`)
- [ ] shadcn components live here, re-exported
- [ ] Tailwind config shared via preset

### Tooling
- [ ] Biome for lint + format (faster than ESLint+Prettier, one config)
- [ ] Vitest installed at root, configured per package (incl. `apps/mcp`)
- [ ] Playwright installed in `e2e/` — single smoke test hitting homepage
- [ ] MCP smoke test in `e2e/mcp/`: spawns the server in stdio, calls `tools/list`, asserts `ping` is present
- [ ] `tsc --noEmit` works for every package via `just check`

### CI
- [ ] `.github/workflows/ci.yml` — runs `just ci` on PR + push to main
- [ ] Caches pnpm store + turbo

### Docs
- [ ] `CLAUDE.md` at repo root: setup, architecture overview, data model summary, state machine diagram, commands cheatsheet
- [ ] `README.md` pointing to `tasks/milestones/README.md`

## Verification
- `just bootstrap` on clean clone → success
- `just dev` → Next.js on :3000, Convex dev server running, MCP server attached, all three connected
- Open :3000 → see "GTDVibe — M0"
- `just mcp-dev` then `tools/list` via stdio → returns `ping`
- `just ci` → green (includes MCP smoke test)
- Push branch → GitHub Actions green

## Out of scope
- Any domain tables
- Any auth (human or agent) — capability tokens land in M1
- Any real MCP tools beyond `ping`
- Any UI beyond the placeholder homepage
