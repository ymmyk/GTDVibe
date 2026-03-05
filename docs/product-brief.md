# Wave 1 Product Brief — GTD MVP Concept Selection

## 1) Decision Summary

**Selected Concept:** **FlowCapture**

**Why this wins now (Wave 1):**
FlowCapture is the highest-scoring concept from the Wave 0 matrix (**4.65 weighted score**) and directly addresses the most universal GTD failure mode: ideas/tasks not captured fast enough, then lost. This gives us the fastest path to habit-forming daily usage and clean early retention signals.

### Reference to Wave 0 Scoring Matrix
From `docs/concepts/scoring-matrix.md`:
- FlowCapture: **4.65** (Rank #1)
- Context Compass: 4.25
- Loop Ledger: 4.14
- Momentum Mesh: 3.96
- Ops GTD: 3.83

## 2) Selection Rationale (CMO View)

1. **Broadest top-of-funnel appeal:** Nearly every GTD user struggles with capture friction; fewer users immediately need advanced dependency or social workflows.
2. **Fast time-to-value:** Users experience value in the first session (quick capture + triage), reducing onboarding drop-off.
3. **Clear positioning:** “Capture anything in 5 seconds” is simple, memorable, and marketable.
4. **Execution confidence:** Highest feasibility + efficiency profile in Wave 0 means lower MVP risk.
5. **Expansion-ready foundation:** A strong capture substrate can later feed recommendation/context features (Context Compass) and operational rigor features (Loop Ledger/Ops GTD).

## 3) Target User Persona

### Primary Persona: “Overloaded Operator”
- **Role:** PM, founder, consultant, or senior IC
- **Context:** Constant context switching, frequent interrupts, mobile-heavy workday
- **Current pain:** Tasks/ideas arrive faster than they can be organized; inbox becomes overwhelming; weekly reviews get skipped
- **Desired outcome:** Capture instantly, trust the system later, and maintain inbox control without heavy setup

### Jobs-to-be-done
- “When I think of something, let me save it instantly from anywhere.”
- “When I process my inbox, help me classify quickly into GTD buckets.”
- “Help me keep inbox zero realistic even during chaotic weeks.”

## 4) Core MVP Feature Set (Prioritized, max 5)

1. **Universal Quick Capture**
   - Text capture from web/mobile entry points
   - Fast-add with minimal required fields
2. **Voice Capture + Auto-Transcription**
   - Convert voice notes into text inbox items
3. **AI-Assisted GTD Classification**
   - Suggest `next action`, `project`, `waiting for`, or `someday`
4. **Triage Queue (One-pass Processing)**
   - Swipe/tap workflow to accept/edit classification and file item
5. **Daily Inbox-Zero Support**
   - Streak + recovery prompts after missed days

## 5) MVP Scope Boundary

### IN Scope (Wave 1 MVP)
- Fast multimodal capture (text + voice)
- AI parsing/classification suggestions for core GTD buckets
- Inbox triage workflow with manual override
- Lightweight project linking + due date extraction (basic)
- Daily inbox-zero motivation loop (streak + recovery)

### OUT of Scope (Wave 1 MVP)
- Full social accountability pods/feed (Momentum Mesh)
- Advanced context-aware ranking engine with calendar/energy optimization (Context Compass full vision)
- Deep loop health analytics and commitment audit timelines (Loop Ledger full vision)
- Dependency graph + scenario simulation + critical path modeling (Ops GTD)
- Enterprise admin, complex permissions, and team PM replacement workflows

## 6) Rejection Rationale (Non-selected Concepts)

### 1. Context Compass (Rank #2, 4.25)
**Why not now:** High upside but requires reliable context signals, recommendation explainability, and integration complexity early. Better as Phase 2 once capture data quality is established.

### 2. Loop Ledger (Rank #3, 4.14)
**Why not now:** Strong for trust/review discipline, but assumes users already maintain structured project/task hygiene. FlowCapture must come first to reliably populate that system.

### 3. Momentum Mesh (Rank #4, 3.96)
**Why not now:** Value depends on behavior of multiple people (pods), increasing adoption risk and onboarding friction for MVP.

### 4. Ops GTD (Rank #5, 3.83)
**Why not now:** Strategically differentiated, but dependency graph UX and complexity are too high for first release; likely to delay learning cycle.

## 7) Success Metrics / KPIs

### Activation
- **A1:** % of new users completing first capture within 5 minutes of signup
- **A2:** Median time to first capture (target: <60 seconds)

### Engagement
- **E1:** Captures per active user per day
- **E2:** % of users processing inbox at least 4 days/week
- **E3:** Weekly triage completion rate

### Retention
- **R1:** D7 retention
- **R2:** D30 retention
- **R3:** % users maintaining 7-day inbox-processing streak at least once in first month

### Quality
- **Q1:** AI classification acceptance rate (without manual edit)
- **Q2:** Voice transcription edit rate (lower is better)

## 8) Competitive Landscape (Summary)

- **Todoist / TickTick:** Strong task management depth, but quick capture-to-structured-GTD flow can still feel manual.
- **Things / OmniFocus:** Excellent GTD heritage for power users; onboarding and ongoing triage burden can be high for mainstream users.
- **Notion / ClickUp:** Flexible but often over-configurable for rapid personal capture moments.
- **Voice assistants / notes apps:** Great raw capture, weak GTD-ready structuring.

**Positioning gap we target:**
A product that combines *frictionless capture* with *immediate GTD-ready organization* for busy professionals.

## 9) Brand & Tone Direction

### Brand Promise
“Your trusted external brain for fast capture and calm follow-through.”

### Tone
- **Calm, decisive, non-judgmental**
- **Action-oriented** (clear next step language)
- **Supportive under load** (recovery, not guilt)

### Messaging Pillars
1. Capture in seconds
2. Organize with confidence
3. Stay in control daily

## 10) Backend Decision Confirmation

**Confirmed backend choice: SpacetimeDB.**

Although FlowCapture originally proposed Node/Postgres in ideation, Wave 1 implementation direction will standardize on **SpacetimeDB** to align with platform strategy, real-time state sync needs, and future expansion into context-aware prioritization/dependency-aware features.

## 11) Risks & Mitigations

1. **Risk:** AI misclassification reduces trust
   - **Mitigation:** Explainable suggestions, one-tap correction, confidence thresholds
2. **Risk:** Voice transcription quality variance
   - **Mitigation:** Fast edit UX, fallback text capture prompts
3. **Risk:** Users capture but don’t triage
   - **Mitigation:** Daily triage nudges, small-batch triage mode, recovery prompts

## 12) Next-Step Recommendation (Post-MVP)

If Wave 1 metrics validate capture + triage behavior, prioritize **Context Compass** capabilities next (starting with “Best next 3” recommendations) using the SpacetimeDB foundation.
