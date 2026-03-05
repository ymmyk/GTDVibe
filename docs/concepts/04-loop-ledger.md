# Concept 4 — Loop Ledger

**Tagline:** Never let open loops go stale.

## Primary Differentiator
Open-loop decay tracking with proactive rescue workflows for stale projects and neglected commitments.

## 3 Key Differentiators
1. **Loop health score** per project based on recency, blockers, and deferred actions.
2. **Review autopilot** converts weekly review into a guided exception workflow.
3. **Commitment ledger** logs promises made vs. promises closed.

## Target User
Managers and operators juggling many active commitments who need reliable review discipline.

## Core Features (max 5)
1. Weekly review cockpit with anomaly highlights.
2. Stale-loop detection and one-tap rescue actions.
3. Commitment timeline with audit trail.
4. Blocker taxonomy and trend reporting.
5. Recovery playbooks (renegotiate, delegate, defer, delete).

## Tech Stack Recommendation
- **Frontend:** Next.js web app (desktop-first)
- **Backend:** Python (FastAPI) + PostgreSQL
- **Data:** Time-series metrics store for loop-health trends
- **Automation:** Scheduled jobs for weekly review prep

## Research Notes (existing GTD pain points addressed)
- Weekly review is often skipped because it feels overwhelming.
- GTD systems break when stale loops are invisible.
- Users want trust in their system, not just more task entry surfaces.