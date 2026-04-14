# M4 — Item Detail + Activity Log

**Goal:** Full item page with inline editing, log stream, sub-items, and state machine-aware status controls.

**Exit criterion:** Manual walkthrough — create "Bathroom Remodel" with 3 children, add logs to parent and children, cannot complete parent without confirmation warning. All state transitions respect state machine.

## Tasks

### Route (`app/items/[id]/page.tsx`)
- [ ] Reactive query via `items.byId`
- [ ] 404 / empty state if item not in user's household
- [ ] Back button → returns to previous list

### Header
- [ ] Inline-editable title (click to edit, blur to save, `Esc` cancels)
- [ ] Status badge with dropdown — illegal transitions greyed out via state machine import
- [ ] On `* → waiting`: inline prompt for `waiting_for` text before committing
- [ ] Owner avatar (click to reassign — picker of household members + "Unassigned")
- [ ] Overflow menu: archive, re-open (if completed), move to parent, delete (admin only)

### Body
- [ ] Multi-line textarea for notes
- [ ] Plain text only — no markdown render at MVP
- [ ] Autosave on blur (debounced 500ms during typing)
- [ ] Placeholder: "Notes, context, links…"

### Metadata row
- [ ] Area picker (multi-select via `item_tags` — not just single `area_id`)
- [ ] Priority segmented control (none / low / med / high / urgent)
- [ ] Due date picker (optional, clearable)
- [ ] `waiting_for` field — visible only when status=`waiting`, editable

### Activity log
- [ ] Reverse chronological stream
- [ ] Grouped by day ("Today", "Yesterday", "Apr 8")
- [ ] User entries: avatar + display_name + body + relative time
- [ ] System entries: italic, muted color, icon per event type
- [ ] Log entry field pinned at bottom of panel
  - Textarea, `Enter` submits, `Shift+Enter` newline
  - Optimistic insert
  - Char counter when > 9000
- [ ] Autoscroll to bottom on new entry (unless user scrolled up)

### Sub-items
- [ ] Children list below metadata, above log
- [ ] Each row: checkbox (shortcut to complete), title, owner, status
- [ ] Inline "Add sub-item" input at bottom of children list
- [ ] Parent shows "X of Y done" rollup
- [ ] Attempt to complete parent with open children → confirm modal "3 sub-items are still open. Complete anyway?"

### System log events (from M2 mutations, display layer only)
- [ ] Status changes: "Alex moved to waiting (waiting on: Dr. Kwan office)"
- [ ] Reassignment: "Sam assigned to Alex"
- [ ] Unblock: "Alex marked unblocked"
- [ ] Re-open: "Alex re-opened"
- [ ] Cascade archive: "Archived with 3 sub-items"
- [ ] Parent move: "Moved under Bathroom Remodel"

### Tests
- [ ] Playwright: create item → edit title inline → reload → title persists
- [ ] Playwright: add log → appears in stream → visible in other browser context
- [ ] Playwright: parent with 3 children → attempt complete → confirmation modal
- [ ] Playwright: `active → waiting` prompts for waiting_for
- [ ] Playwright: reassign creates system log visible in stream

## Verification
- Bathroom Remodel scenario works end-to-end
- Long-horizon scenario: create item, add 10 logs, all render correctly with day grouping
- State machine prevents illegal transitions in UI (buttons disabled, not just server reject)

## Out of scope
- Markdown rendering
- File attachments
- Mentions (@alex)
- Log reactions/emoji
- Log editing (append-only is a feature, not a bug)
