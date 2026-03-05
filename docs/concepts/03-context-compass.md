# Concept 3 — Context Compass

**Tagline:** The right next action, for this exact moment.

## Primary Differentiator
Context-aware next-action ranking using live signals (time available, location, energy level, tool availability).

## 3 Key Differentiators
1. **Adaptive action shortlist** dynamically reorders tasks by current context.
2. **Energy-aware planning** maps tasks to user-defined cognitive intensity bands.
3. **Context packs** (Office, Commute, Deep Work, Errands) with auto-activation rules.

## Target User
Knowledge workers with fragmented schedules who know GTD but struggle to choose what to do now.

## Core Features (max 5)
1. Context rule engine with manual overrides.
2. Quick energy check-in and focus window timer.
3. “Best next 3” recommendations with explainability.
4. Calendar integration for available-time windows.
5. End-of-day adaptation feedback loop.

## Tech Stack Recommendation
- **Frontend:** React + React Native
- **Backend:** **SpacetimeDB** for low-latency state sync + Rust services
- **Integrations:** Google/Microsoft Calendar APIs
- **ML layer:** Lightweight ranking model + rules fallback

## Research Notes (existing GTD pain points addressed)
- Current GTD apps rely on static contexts/tags that decay quickly.
- Users spend too long deciding among many possible next actions.
- Time/energy mismatch causes procrastination despite clear task lists.