# M7 — Ship

**Goal:** Deploy to production, dogfood with actual co-parent **and at least one real agent**, gather feedback before touching v2.

**Exit criterion:** The real household uses GTDVibe daily for 2 weeks without hitting a blocker bug. At least 50 real items captured, at least 20 resolved, and at least 10 of those captures or logs come through an agent via MCP.

## Tasks

### Production deploy
- [ ] Convex production deployment (separate from dev)
- [ ] Vercel project connected to `main` branch (web + MCP HTTP transport — both deployable from the same repo)
- [ ] Env vars configured: Convex URL, auth secrets, agent-token signing pepper
- [ ] Custom domain (e.g. `gtdvibe.app` or subdomain on existing domain)
- [ ] MCP endpoint published at `https://<domain>/mcp` with HTTP+SSE transport
- [ ] SSL verified for both web and MCP endpoints
- [ ] Robots.txt disallow (not a public site)
- [ ] MCP endpoint rate-limited at the edge in addition to per-token in-app limits

### Auth & access
- [ ] Disable open sign-up (invite-only)
- [ ] Create the real household
- [ ] Invite co-parent via email (manual — invite URL)
- [ ] Verify invite flow in production
- [ ] Each user provisions at least one agent in `/settings/agents`, configures Claude Desktop (or equivalent) with the issued token, and verifies a roundtrip `query_items` call lands in `last_used_at`

### Monitoring
- [ ] Convex dashboard bookmarked
- [ ] Vercel analytics enabled (free tier)
- [ ] Manual error check: browser console clean on all main routes
- [ ] MCP server logs (stderr) shipped to Vercel/Convex log drain; spot-check daily for auth failures and rate-limit hits
- [ ] Track agent_call counts per token per day — anomalies (e.g., 100x normal) are an early signal of a misbehaving agent

### Data migration / reset
- [ ] Ensure demo seed does NOT run in production
- [ ] Clean production DB before first real use

### Dogfood checklist
- [ ] Capture 5 items on day 1 (mix of task, project, someday)
- [ ] Assign each to an owner
- [ ] Add logs daily
- [ ] At least one agent-driven workflow exercised daily (e.g., daily standup digest, "what's been waiting >7 days" check, capture-from-email)
- [ ] Run weekly "review" session between both users
- [ ] Keep a notebook/doc of friction points during the 2-week window — separate sections for human-UX friction and agent/MCP friction

### Feedback loop
- [ ] At end of 2 weeks: write a `docs/dogfood-notes.md` with:
  - What worked
  - What didn't
  - Top 5 human-UX friction points ranked
  - Top 5 agent/MCP friction points ranked (missing tools, ambiguous descriptions, error message quality)
  - v2 feature priorities derived from actual use
- [ ] DO NOT build new features during dogfood — only fix bugs and clarify tool descriptions (one-line MCP description tweaks count as bug fixes)

### Bug backlog
- [ ] Maintain `tasks/bugs.md` — any bug found in production, log with severity
- [ ] Severity 1 (blocks core loop): fix same day
- [ ] Severity 2 (annoying): fix within the dogfood window
- [ ] Severity 3 (polish): defer to v2

## Verification
- Both users actively using the app without asking for help
- At least one non-trivial project (multi-sub-item, 5+ logs) completed entirely inside GTDVibe
- At least one project shows a healthy mix of human and agent log entries
- Zero data loss incidents
- Zero "I gave up and used Notes app" incidents
- Zero unauthorized cross-household or revoked-token successful calls

## Out of scope
- Marketing page
- Landing site
- External beta users
- App store submission
- All v2 features
