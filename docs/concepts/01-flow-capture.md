# Concept 1 — FlowCapture

**Tagline:** Capture anything in 5 seconds, organize it later.

## Primary Differentiator
Ultra-fast multimodal capture (text, voice, screenshot, forward-email) that auto-normalizes into GTD inbox items.

## 3 Key Differentiators
1. **One-tap capture bar** across mobile/desktop with offline queue.
2. **AI-assisted parsing** converts raw input into `next action`, `project`, `waiting for`, or `someday` suggestions.
3. **Inbox confidence score** highlights ambiguous captures needing clarification during daily triage.

## Target User
Busy individual contributors (PMs, founders, consultants) who frequently capture ideas on the go but struggle with inbox overload.

## Core Features (max 5)
1. Universal quick-capture widget (mobile, desktop, share-sheet, email).
2. Auto-transcription + intent extraction for voice notes.
3. Triage queue with one-swipe GTD classification.
4. Lightweight project linking and due-date extraction.
5. Daily inbox-zero streak with recovery prompts.

## Tech Stack Recommendation
- **Frontend:** React Native + Next.js
- **Backend:** Node.js (Fastify) + PostgreSQL
- **AI services:** Whisper-compatible STT + LLM classification service
- **Infra:** Redis queue for async parsing, object storage for audio/screenshots

## Research Notes (existing GTD pain points addressed)
- Many apps optimize organization but not **capture speed**, causing task leakage.
- Voice capture exists but often lacks reliable structuring into GTD buckets.
- Inbox triage is cognitively heavy; users abandon during busy weeks.