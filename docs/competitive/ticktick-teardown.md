# TickTick Teardown

Reference for what to steal, what to skip, and where our moat actually lives. Written so future-us doesn't have to re-derive this every time TickTick ships a feature.

## Why TickTick is the right reference

It's the closest "looks good + works fast" GTD-ish app on the market. Cross-platform native, sub-second capture, mature visual polish. If we beat their feel on the three dimensions we care about (agents, household, history), we have a defensible product.

## Steal (in milestone order)

### 1. Smart capture parser → M3 stretch
- Input: `"call dentist tomorrow 2pm #health @sam"` → `{ title: "call dentist", due_date, area: "health", owner: "sam" }`
- Lives in `packages/shared/src/capture/parse.ts` so the same parser runs in the GUI capture bar **and** the MCP `capture_item` tool (string args get parsed as a fallback)
- Sugar, not magic — show parsed chips inline before commit so user can correct
- ~200 LoC, no NLP library, regex + a tiny date library (`chrono-node`)

### 2. Density toggle → M5
- `comfortable` (default, 56px rows) / `compact` (40px rows)
- Persisted per-user in localStorage; URL param `density=compact` for power users
- TickTick's compact mode is what makes them feel fast — ~25 tasks above the fold vs. our shadcn-default ~10

### 3. "Today" view as a lens → M5
- Not a new screen — a saved filter `status in (active, waiting) AND (due_date <= today OR has_log_in_24h)`
- Adds to home page as a section, not a tab
- Avoids becoming a date-tyranny app while giving daily-driver users the view they want

### 4. Tray-style global capture (desktop PWA) → M6 polish
- `Ctrl+Shift+Space` opens capture even when app is backgrounded
- PWA Window Controls Overlay + Launch Handler API where supported
- Fallback: a tiny Tauri wrapper later if PWA ceiling hits — out of MVP scope

## Skip

| Their thing | Why we skip |
|---|---|
| Date-first IA (Today / Tomorrow / Next 7 Days as primary axis) | Household work is state-driven, not date-driven. Our axis (Inbox/Active/Waiting/Completed) is correct for the user. |
| Premium paywall on filters/calendar | Hostile for a 2-user household app. We don't have a freemium business. |
| Gamification (achievement points) | Sugar. Doesn't survive contact with adults coordinating real work. |
| Pomodoro + habit grafted onto tasks | Different mental model (timeboxed self-improvement vs. open-loop tracking). Adding it dilutes the GTD core. |
| Subtask depth used at 5 levels in UI | Our cap is 5 but the UI should encourage ≤2. Deep trees are a smell. |
| Flat global tag system | Areas (Home/Kids/Health) beat free-form tags for households. We already chose this. |
| Markdown + checklists in body | Plain text only at MVP. Append-only logs already give us structure-via-time. |

## Their visual polish, decomposed

What "TickTick looks good" actually means, so we can match without a designer:

1. **Tight typography scale** — one font (system or Inter), well-tuned line-height (1.4 on body, 1.2 on headings)
2. **Padding 12–16px**, not shadcn's default 24px on cards
3. **Single accent color**, gray scale carries the work — no rainbow priority chips
4. **`--radius: 0.375rem`**, not shadcn's default `0.5rem`. Sharper feels more pro.
5. **60fps row hover/select transitions**, not flashy — `transition: background 80ms ease`
6. **Empty states are illustrations**, not just text. One SVG each for inbox/waiting/search.

We get 80% of this from shadcn for free. The remaining 20% is two M6 days on `packages/ui` design tokens.

## Where our moat actually is

Quantified honestly:

| Dimension | TickTick | Us (post-MVP) | Edge |
|---|---|---|---|
| Capture speed | 9/10 | 8/10 (PWA ceiling) | Them |
| Visual polish | 8/10 | 6–7/10 default | Them (closeable) |
| Comments / activity log | 3/10 | 9/10 | **Us** |
| Real-time multi-user | 4/10 | 9/10 (Convex) | **Us** |
| Agent / MCP | 0/10 | 9/10 | **Us** |
| Household model | 4/10 | 8/10 | **Us** |
| Cross-platform native | 9/10 | 4/10 (PWA only) | Them |
| Smart text parsing | 9/10 | 6/10 (after #1 above) | Them (narrowed) |
| Date views | 9/10 | 6/10 | Them (acceptable — not our axis) |

We win on the four things that matter for the actual user. We narrow on two cheap ones. We accept losing on cross-platform native until dogfooding tells us PWA hit a ceiling.

## Anti-pivot guard

If a future iteration of this doc starts arguing for native apps, calendar-first IA, or pomodoro/habits, that's drift. The four steals above are bounded. Anything beyond them needs to be re-justified against the agent + household + history thesis.
