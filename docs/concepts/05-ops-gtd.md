# Concept 5 — Ops GTD

**Tagline:** Personal GTD meets real dependency management.

## Primary Differentiator
Dependency-aware GTD that models cross-project blockers and critical paths in real time.

## 3 Key Differentiators
1. **Task dependency graph** across personal and team-facing commitments.
2. **Critical-path alerts** for next actions that unblock multiple downstream tasks.
3. **Scenario mode** simulates impact of delays or priority changes.

## Target User
Startup operators and technical leads coordinating many interdependent initiatives.

## Core Features (max 5)
1. Visual dependency map for projects and actions.
2. Blocker-first daily queue.
3. “If this slips, what breaks?” impact preview.
4. Waiting-for SLA timers and escalation nudges.
5. Cross-project weekly review with bottleneck summary.

## Tech Stack Recommendation
- **Frontend:** SvelteKit + D3 graph components
- **Backend:** **SpacetimeDB** + Rust for real-time graph state
- **APIs:** Webhooks for Slack/Email updates
- **Infra:** Event-driven workers for dependency recalculation

## Research Notes (existing GTD pain points addressed)
- Traditional GTD tools treat tasks as isolated, ignoring real dependency chains.
- “Waiting For” is rarely linked to downstream impact.
- Operators need actionable prioritization when everything is urgent.