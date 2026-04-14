# M0 — Foundation

**Goal:** Scaffolding only, no features. Prove the toolchain works end to end.

**Exit criterion:** Fresh clone → `just bootstrap && just dev` boots Next.js + Convex in ≤3 min. Empty homepage renders. `just ci` green.

## Tasks

### Repo & monorepo
- [ ] pnpm workspace: `pnpm-workspace.yaml` with `apps/*` and `packages/*`
- [ ] Turborepo: `turbo.json` with `dev`, `build`, `check`, `test` pipelines
- [ ] Root `package.json` with workspace scripts delegating to `just`
- [ ] `.nvmrc` pinned to Node 20 LTS
- [ ] `.gitignore` covers `.next`, `node_modules`, `.convex`, `.turbo`

### justfile
- [ ] Implement all commands from the grand plan `justfile` section
- [ ] `just dev` runs Convex + Next.js concurrently (use `concurrently` or `just` parallel)

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
- [ ] `.env.local.example` documenting required env vars

### Shared package (`packages/shared`)
- [ ] TypeScript project with `tsconfig.json` extending root
- [ ] Empty exports for `schema`, `stateMachine`, `types`
- [ ] Zod installed

### UI package (`packages/ui`)
- [ ] shadcn components live here, re-exported
- [ ] Tailwind config shared via preset

### Tooling
- [ ] Biome for lint + format (faster than ESLint+Prettier, one config)
- [ ] Vitest installed at root, configured per package
- [ ] Playwright installed in `e2e/` — single smoke test hitting homepage
- [ ] `tsc --noEmit` works for every package via `just check`

### CI
- [ ] `.github/workflows/ci.yml` — runs `just ci` on PR + push to main
- [ ] Caches pnpm store + turbo

### Docs
- [ ] `CLAUDE.md` at repo root: setup, architecture overview, data model summary, state machine diagram, commands cheatsheet
- [ ] `README.md` pointing to `tasks/milestones/README.md`

## Verification
- `just bootstrap` on clean clone → success
- `just dev` → Next.js on :3000, Convex dev server running, both connected
- Open :3000 → see "GTDVibe — M0"
- `just ci` → green
- Push branch → GitHub Actions green

## Out of scope
- Any domain tables
- Any auth
- Any UI beyond the placeholder homepage
