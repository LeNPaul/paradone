# Paradone Focus Timer — v1 Spec

**Status:** Draft for build
**Last updated:** 2026-07-13

---

## 1. What does the app do?

A pomodoro-inspired deep work timer that audits **intention vs. reality**. Before a session, the user states what they intend to do. During the session, distractions are captured without breaking flow. After the session, the user is asked what actually got done and whether the block was focused or distracted. The session is exportable as markdown.

The differentiator is the **audit loop** — not the timer. Every other pomodoro app congratulates you when the bell rings without asking whether the block was real work. This one asks.

## 2. Who uses it?

Knowledge workers who already suspect they self-deceive about their productivity — people who "did four pomodoros" but couldn't say what came out of them. Secondary: anyone who has bounced off rigid 25/5 timers because the interval didn't fit their work.

The user arrives via paradone.com's productivity technique reference content and stays because the tool is embedded in the article rather than being another countdown clock.

## 3. Key screens (single-page state machine)

There is no routing. One page, eight states.

| State | Purpose |
|---|---|
| **Setup** | Task List (persistent, editable, checkbox-aware) — add/edit/delete tasks + optional 2-minute primer link + Start |
| **Primer setup** *(optional)* | Break the task down into something doable in 2 minutes, typed into a free-text area, then start the countdown |
| **Primer** *(optional)* | 2-minute timer showing that breakdown, then: commit to a full session, or stop here |
| **Active** | Countdown, task list rendered with live checkboxes (toggle-only, no textarea), capture scratchpad always available |
| **Block end** | Bell → "take the break, keep going, or wrap up?" — keeping going chains another block onto the same session |
| **Break** *(skippable)* | Break countdown |
| **Audit** | What actually got done? Focused or distracted? Shown alongside the current task list |
| **Summary** | Compiled markdown (task list, capture notes, audit), copy or download, start new session |

### Screen behaviours

- **Task List** is a single persistent checklist, cross-session, stored as a markdown string. At Setup you build it through structured controls — an **Add Task** button opens a modal to enter a task, and each existing task has edit and delete controls (no raw-markdown textarea). During Active it's checkbox-toggle-only. The same list is shown read-only at Audit and Summary — at Audit only the unchecked remainder, so completed work appears once and only under **completed-this-session** — and whatever the list contains at the moment a session ends *is* the export content — a full snapshot, plus a derived **completed-this-session** list alongside it.
- **Completed this session** is derived, not stored per task: the list is snapshotted when the block starts, and a task counts as completed if it is checked at the end and was *not* checked at the start. A task added mid-session and then ticked counts. Unticking a box during the block does not. Shown at Audit, exported in the Summary markdown, and recorded on the session so the audit log can show it.
- **Capture box** is a freeform scratchpad textarea, pinned and available in every active state. You write into it continuously as things come up — not discrete, timestamped entries. Whatever it contains at session end is exported verbatim at summary — never triaged mid-block.
- **2-minute primer** is optional and skippable — surfaced as a "need help starting?" affordance, never a gate on starting work (plain **Start** never touches it). Choosing it first asks for a breakdown: what can you do in 2 minutes, in a free-text area. That text is required before the countdown starts — an empty primer defeats the point of the step — and it stays visible through the primer and the full focus block, then lands in the session record as `primerIntent`.
- **Archive** keeps the Task List from growing unbounded. At Setup, one "Archive completed" button sweeps every checked task off the list into `paradone:archive`; it is not offered during a session, where the list stays toggle-only. Each archived task carries the time its box was *ticked*, not the time it was swept — so the tick time is recorded when the checkbox changes and held until the sweep. That map keys on the marker-stripped task text (the identity `completedSince` already uses) and is rebuilt on every Task List write, so unticking, deleting, or renaming a task drops its entry. Tasks checked before this existed have no recorded tick time and fall back to the archive time. Like the audit log, the archive is a **view toggle**, not a machine state, reached from "View archive" at Setup and dismissed with "Back", with one "Download archive" button for the whole list. A "Clear archive" button — offered only when there is something to clear, and confirmed in a dialog — empties the swept-task list. It drops *only* the swept tasks: the tick-time map is left alone, because it belongs to tasks still on the live Task List.
- **Settings** holds the work and break durations and the light/dark toggle. Like the archive and audit log it is a **view toggle**, not a machine state, so it never lands in `paradone:activeSession`. Unlike them it is reached from a gear button in the app header, which sits outside the state machine and is therefore present in *every* state — that is what keeps the theme switchable mid-session. It replaces whatever is on screen and is dismissed with "Back", and it closes itself when the machine advances so a block ending behind it can't swallow the "take the break, keep going, or wrap up?" prompt. Durations are read when a timer is created, so editing them mid-block affects the next block, never the running one.
- **Audit log** is a read-only view of every past audit, newest first, reached from a "View log" button at Setup and dismissed with "Back". It is not a machine state — it's a view toggle, so it never lands in `paradone:activeSession`. Each entry shows timestamps, planned/actual duration, focus rating and audit notes; skipped audits are listed and marked as such. One "Download log" button exports the whole log as markdown — there is no per-entry download. A "Clear log" button — offered only when there is something to clear, and confirmed in a dialog — empties `paradone:sessions`; there is no per-entry delete. The session record is appended when the audit is answered or skipped, *not* when the user starts the next session, so closing the tab at Summary cannot lose an audit. Chronological only — aggregates and trends stay deferred (§6).

## 4. Data model

```js
// paradone:prefs
{
  workDuration: 25,      // minutes, user-editable
  breakDuration: 5,      // minutes, user-editable; 0 = no breaks
  theme: "light",        // "light" | "dark"; seeded once from the OS, then fixed
}

// paradone:goalsList  — the single persistent Task List, cross-session
{
  text: "- [ ] draft outline\n- [x] send invoice\n- ideas for post",
  updatedAt: "2026-07-13T09:00:00Z"
}

// paradone:sessions  — append-only array
[{
  id: "uuid",
  date: "2026-07-13T09:15:00Z",       // session start
  auditedAt: "2026-07-13T09:40:00Z",  // when the audit was answered or skipped — the log's sort key
  taskListText: "- [ ] draft outline\n- [x] send invoice",   // full Task List snapshot at session end
  completedTasks: ["send invoice"],   // ticked during this block; absent on records written before this existed
  plannedDuration: 25,
  actualDuration: 25,
  capture: "reply to Mai re: weekend\ncheck the deploy logs",   // freeform scratchpad text
  usedPrimer: false,
  primerIntent: "open the doc and write one sentence",   // the 2-minute breakdown, "" when no primer was used
  auditProductive: "focused" | "distracted" | "mixed",
  auditNotes: "got the outline done, tabbed out twice"
}]

// paradone:activeSession  — in-progress session, so a page reload doesn't lose the block

// paradone:archive  — tasks swept off the Task List, plus the tick times of ones still on it
{
  completedAt: { "draft outline": "2026-08-01T09:14:00Z" },  // checked, still on the list
  archived: [{
    id: "uuid",
    text: "send invoice",
    completedAt: "2026-07-30T11:00:00Z",  // when the box was ticked
    archivedAt: "2026-08-01T09:20:00Z"    // when it was swept off the list
  }]
}
```

### Markdown parsing (the fiddly part)

The **source of truth is a raw markdown string**, not a structured array. Parse it into line-items on render so `- [ ]` lines become clickable checkboxes; clicking one rewrites the underlying string and re-saves. The Setup add/edit/delete controls are just string operations too — adding appends a `- [ ]` line, editing rewrites one line's text, deleting drops a line — so the string stays the single source of truth.

- Item identity keys on a **content hash of the line**, not line index — so add/edit/delete (and any reorder) don't attach a checked box to the wrong line.
- Parsed items carry the marker-stripped task `text`. The completed-this-session diff keys on that **text**, not the hash: the hash covers the whole line including the `- [x] ` marker, so toggling a box changes it. An in-progress session persists its start snapshot to `paradone:activeSession`; when that snapshot is missing (a block started before this existed) the diff reports nothing rather than claiming every checked task.
- Non-checkbox lines (plain bullets, free text) render as-is and are simply not clickable. New tasks are always added as `- [ ]` checkbox lines; plain lines only arise from pre-existing stored data.
- This same component is instantiated across every state that shows the Task List (Setup, Active, Audit, Summary), always bound to the one persistent `paradone:goalsList` store — editable (add/edit/delete + toggle) at Setup, toggle-only at Active, read-only at Audit/Summary.

## 5. Constraints

**Non-negotiable:**
- **Frontend: Vue 3.5.x + Vite.** `<script setup>` SFCs. Not Vue 3.6 / Vapor Mode — still beta at time of writing. Stack deliberately matches Cheqist (Vue 3.5, Vite, Pinia) for maintainer sanity; scope stays separate regardless.
- Ships as a **static Vite build** (`vite build` → `dist/`) deployed on GitHub Pages. **No backend, ever** — no API calls, no auth, no accounts, no server-side persistence. Vue/Pinia are the only runtime deps in the bundle.
- All state in `localStorage`. Nothing leaves the browser. This is a *feature* — "no account, no tracking, your data stays on your device" is the positioning, not a limitation.
- **Testing: Vitest + `@vue/test-utils`.** Dev-only; never shipped. Pure logic (parser, storage, timer math) gets unit tests; components get mounted tests.
- Export is markdown, generated client-side.

**Explicit non-goals (scope fences):**
- ❌ No due dates, projects, priority levels, or tags on the Task List. It is a flat markdown checklist and stays one. *(The moment it grows these, it is quietly rebuilding Cheqist.)*
- ❌ No stopwatch/flowtime mode in v1. Countdown is the default and the only mode.
- ❌ No sync, no cross-device, no real-time features.
- ❌ No AI/LLM calls. The honesty mechanic is UI and logic, not inference.

## 6. Deferred to v1.1+

- Stopwatch / flowtime mode (run until focus breaks, log real duration)
- Focus-debt counter and cross-session trend view
- Desktop app (floating always-on-top timer, global keyboard shortcut for distraction capture) — this is the intended **paid** tier
- PWA / offline install

## 7. Components

**Components (`.vue`):**

| Component | Owns |
|---|---|
| `TimerDisplay.vue` | Countdown render (mm:ss), visually distinct primer vs. session states |
| `MarkdownChecklist.vue` | Parse → render → toggle → write-back. Bound to the single persistent Task List, reused across Setup/Active/Audit/Summary |
| `CaptureBox.vue` | Freeform scratchpad textarea |
| `AuditPrompt.vue` | Two questions: what got done, focused/distracted/mixed. Quick-select + optional free text |
| `SessionSummary.vue` | Assembles markdown, copy + download |
| `SessionLog.vue` | Read-only list of past audits, newest first, + download-whole-log, + clear-log |
| `ArchiveView.vue` | Read-only list of archived tasks with completion times, newest first, + download-archive, + clear-archive |
| `ConfirmDialog.vue` | Native `<dialog>` confirmation gating a destructive action |
| `SettingsPanel.vue` | Work/break durations; stored separately from session data. Rendered in the Settings view, alongside `ThemeToggle.vue` |

**Logic modules (plain `.js`, unit-tested, no component mounting):**

| Module | Owns |
|---|---|
| `storage.js` | All `localStorage` read/write. Nothing else touches storage directly |
| `checklist.js` | Markdown parse, content-hash keying, toggle-rewrite. The parser lives here, not in the component |
| `timer.js` | Countdown/tick math, duration calculations |
| `sessionLog.js` | Audit-log sorting, date/time formatting, log markdown generation |
| `archive.js` | Tick-time bookkeeping, the archive sweep, archive markdown generation |
| `download.js` | Blob-and-anchor file download, shared by both exports |

Keeping logic out of the SFCs is deliberate — it's what makes the tricky parts testable with plain Vitest instead of mounted-component tests.

## 8. Acceptance criteria

- [ ] Timer defaults to 25/5; both durations editable in the Settings view and persisted
- [ ] The Settings view is reachable from the header gear in every state, replaces the current screen, returns with "Back", and closes itself when the session machine advances
- [ ] Light/dark toggle lives in the Settings view, which is reachable in every state, applies immediately, and persists to `paradone:prefs`; on first load it takes the OS preference, and after that the stored choice wins with no flash of the wrong palette on reload
- [ ] Break duration of 0 skips the break state entirely
- [ ] Task List persists across page reloads and across sessions
- [ ] At Setup, tasks can be added via the Add-Task modal, edited, and deleted, and each change persists to `paradone:goalsList`
- [ ] Checkboxes in the Task List are clickable and persist their state, both at Setup and during an active session
- [ ] "Archive completed" at Setup removes every checked task from the Task List and persists them to `paradone:archive`, leaving unchecked and plain lines in place
- [ ] An archived task records the time its checkbox was ticked — surviving a reload between the tick and the sweep — not the time it was archived
- [ ] The archive view lists archived tasks newest-first with their completion times, and downloads in full as one markdown file
- [ ] "Clear archive" empties `paradone:archive.archived` after a confirmation dialog, leaves the tick-time map and the Task List untouched, and survives a reload
- [ ] Capture box is reachable in every active state without leaving the timer
- [ ] Reloading the page mid-session restores the running block from `paradone:activeSession`
- [ ] At block end, user can choose break, continue, or end the session
- [ ] "Keep going" starts another work block immediately, in the same session — planned and actual duration accumulate across chained blocks into one log record
- [ ] An in-progress break can be ended early, going straight to the audit
- [ ] Audit prompt shows the unchecked remainder of the Task List alongside the questions; checked tasks appear only under Completed this session
- [ ] Audit prompt lists the tasks ticked during the block — not ones already checked before it started — and says so when there were none
- [ ] Summary exports valid markdown containing the Task List snapshot, the completed-this-session list, capture notes, and audit answers
- [ ] Audit log entries list the tasks completed in that block, on screen and in the log export
- [ ] Every audit is appended to `paradone:sessions` the moment it is answered or skipped, and survives closing the tab at Summary
- [ ] The audit log lists all past audits newest-first with date/time stamps, and downloads in full as one markdown file
- [ ] "Clear log" empties `paradone:sessions` after a confirmation dialog and survives a reload
- [ ] App functions with zero network requests after initial page load
- [ ] `checklist.js` has unit tests: checkbox parse, plain-line passthrough, toggle-rewrite, add/remove/edit-item, hash stability across line reorder, completed-since diff
- [ ] `storage.js` has a round-trip test (write → read → deep-equal) for each entity
- [ ] `vite build` produces a `dist/` that runs correctly when served as static files
- [ ] CI runs `vitest run` and blocks deploy on failure
- [ ] Vite `base` is `'/'` (apex domain paradone.com) and a `CNAME` file with `paradone.com` ships in the build output
