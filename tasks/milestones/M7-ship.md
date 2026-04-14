# M7 — Ship

**Goal:** Deploy to production, dogfood with actual co-parent, gather feedback before touching v2.

**Exit criterion:** The real household uses GTDVibe daily for 2 weeks without hitting a blocker bug. At least 50 real items captured and at least 20 resolved.

## Tasks

### Production deploy
- [ ] Convex production deployment (separate from dev)
- [ ] Vercel project connected to `main` branch
- [ ] Env vars configured: Convex URL, auth secrets
- [ ] Custom domain (e.g. `gtdvibe.app` or subdomain on existing domain)
- [ ] SSL verified
- [ ] Robots.txt disallow (not a public site)

### Auth & access
- [ ] Disable open sign-up (invite-only)
- [ ] Create the real household
- [ ] Invite co-parent via email (manual — invite URL)
- [ ] Verify invite flow in production

### Monitoring
- [ ] Convex dashboard bookmarked
- [ ] Vercel analytics enabled (free tier)
- [ ] Manual error check: browser console clean on all main routes

### Data migration / reset
- [ ] Ensure demo seed does NOT run in production
- [ ] Clean production DB before first real use

### Dogfood checklist
- [ ] Capture 5 items on day 1 (mix of task, project, someday)
- [ ] Assign each to an owner
- [ ] Add logs daily
- [ ] Run weekly "review" session between both users
- [ ] Keep a notebook/doc of friction points during the 2-week window

### Feedback loop
- [ ] At end of 2 weeks: write a `docs/dogfood-notes.md` with:
  - What worked
  - What didn't
  - Top 5 friction points ranked
  - v2 feature priorities derived from actual use
- [ ] DO NOT build new features during dogfood — only fix bugs

### Bug backlog
- [ ] Maintain `tasks/bugs.md` — any bug found in production, log with severity
- [ ] Severity 1 (blocks core loop): fix same day
- [ ] Severity 2 (annoying): fix within the dogfood window
- [ ] Severity 3 (polish): defer to v2

## Verification
- Both users actively using the app without asking for help
- At least one non-trivial project (multi-sub-item, 5+ logs) completed entirely inside GTDVibe
- Zero data loss incidents
- Zero "I gave up and used Notes app" incidents

## Out of scope
- Marketing page
- Landing site
- External beta users
- App store submission
- All v2 features
