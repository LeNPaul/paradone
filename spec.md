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
| **Active** | Countdown, task list rendered with live checkboxes and the same add/edit/delete controls Setup has (no textarea, and no archive sweep) minus anything already checked when the session started, capture scratchpad always available |
| **Block end** | Bell → "take the break, keep going, or wrap up?" — keeping going chains another block onto the same session |
| **Break** *(skippable)* | Break countdown — running out or ending it early both return to Block end, so a break pauses the session rather than ending it. The same countdown is also offered at the Summary, where the session is already logged and so belongs to no session: that one returns to Setup |
| **Audit** | What actually got done? Focused or distracted? Shown alongside the remainder of the task list, still tickable and still editable — or discard the block outright |
| **Summary** | Compiled markdown (completed-this-session list, capture notes, audit), copy or download, take a break, start new session |

### Screen behaviours

- **Task List** is a single persistent checklist, cross-session, stored as a markdown string. At Setup you build it through structured controls — an **Add Task** button opens a modal to enter a task, and each existing task has edit and delete controls (no raw-markdown textarea). During Active it keeps those same add, edit and delete controls — work that surfaces mid-block has to have somewhere to go — with the sole exception of the archive sweep, which would strip checked lines out from under the block's own completed-this-session diff. Tasks already checked when the session started are hidden — they are finished work, and the block is about what's left. Ones ticked *during* the block stay on screen, ticked, so in-block progress is visible and a mis-click can be undone. The list is shown at Audit too, there as only the unchecked remainder, so completed work appears once and only under **completed-this-session**. That remainder is still tickable: the Audit screen asks what actually got done, so the tasks it lists have to be answerable there. It carries the same add, edit and delete controls Active does — minus the archive sweep, for the same reason — because reviewing a block is when the thing you forgot surfaces, and the alternative is finishing the audit before you can write it down. Every change there is **deferred** — a ticked row stays on screen, checked, rather than jumping up to completed-this-session, so a mis-click can be undone; nothing is written to the persistent Task List until the audit is finished. The list is a snapshot frozen when the screen opens rather than a live view of the store, which is what keeps a row from vanishing underneath the user. The Summary does not show the list at all: it recaps the block that just happened, so the **completed-this-session** list is the export content, alongside capture notes and the audit answers.
- **Completed this session** is derived, not stored per task: the list is snapshotted when the block starts, and a task counts as completed if it is checked at the end and was *not* checked at the start. A task added mid-session and then ticked counts, and so does one ticked at the Audit screen itself — the audit ticks are committed to the Task List before the session record is written, so they are simply checked at the end like any other. Unticking a box during the block does not. Shown at Audit, exported in the Summary markdown, and recorded on the session so the audit log can show it. When the block completed nothing, the section is dropped from the Audit and Summary screens rather than shown with placeholder copy — a heading that exists only to say "nothing here" is noise between the user and the questions the Audit is asking. The markdown export keeps its placeholder line, because an exported file should have the same shape every time.
- **Added mid-session** is derived from the same start snapshot: a task counts as added if it is on the list at the end and its marker-stripped text was on no checkbox line at the start, checked or unchecked. Work you planned and work that came up are different signals, so the audit distinguishes them rather than folding a mid-block addition silently into the completed count. It is a superset of what got completed — a task added and left unticked is still recorded — so the display intersects it with **completed-this-session** and marks those rows with an `added` badge; on export the same rows get a `(added mid-session)` suffix. Because the identity is text, renaming a pre-existing task through Edit makes it look added, the same hole `completedSince` already has. Closing it would mean per-task metadata, which the flat-markdown fence rules out.
- **Capture box** is a freeform scratchpad textarea, pinned and available in every active state. You write into it continuously as things come up — not discrete, timestamped entries. Whatever it contains at session end is exported verbatim at summary — never triaged mid-block. Like **completed-this-session**, an empty capture drops the Captures section from the Audit and Summary screens while the markdown export keeps its placeholder line.
- **2-minute primer** is optional and skippable — surfaced as a "need help starting?" affordance, never a gate on starting work (plain **Start** never touches it). Choosing it first asks for a breakdown: what can you do in 2 minutes, in a free-text area. That text is required before the countdown starts — an empty primer defeats the point of the step — and it stays visible through the primer and the full focus block, then lands in the session record as `primerIntent`.
- **Archive** keeps the Task List from growing unbounded. At Setup, one "Archive completed" button sweeps every checked task off the list into `paradone:archive`; it is the one Setup control not offered during a session, because sweeping checked lines off the list mid-block would erase that block's own completed-this-session diff. Each archived task carries the time its box was *ticked*, not the time it was swept — so the tick time is recorded when the checkbox changes and held until the sweep. That map keys on the marker-stripped task text (the identity `completedSince` already uses) and is rebuilt on every Task List write, so unticking, deleting, or renaming a task drops its entry. Tasks checked before this existed have no recorded tick time and fall back to the archive time. Like the audit log, the archive is a **view toggle**, not a machine state, reached from "View archive" at Setup and dismissed with "Back", with one "Download archive" button for the whole list. A "Clear archive" button — offered only when there is something to clear, and confirmed in a dialog — empties the swept-task list. It drops *only* the swept tasks: the tick-time map is left alone, because it belongs to tasks still on the live Task List.
- **Data export and restore** lives in a **Data** block at the bottom of Settings, because losing a browser profile is the one way local-only storage bites. "Export data" downloads a single `paradone-backup-YYYY-MM-DD.json` — a versioned envelope (`format`, `version`, `exportedAt`) wrapping prefs, the Task List, the session log and the archive. Unlike the three markdown exports, which are lossy renderings for a human to read, this one round-trips exactly. "Import data" picks a file, validates the envelope, and — behind a confirm dialog, since it is destructive — **replaces everything**. There is no merge: the Task List is one markdown string with no sane way to reconcile two versions, and a half-merged log is worse than either input. The in-flight session is deliberately *not* in the backup: its timer holds wall-clock timestamps, so a restored one would be stale or wrong. Restoring therefore clears `paradone:activeSession` and reloads the page — every ref is hydrated from storage once at mount, so a reload is the re-hydration. The same block carries **"Clear all data"**, the other half of the local-only promise: behind the same confirm dialog it removes every `paradone:*` key and reloads, leaving the app exactly as a first-time visitor finds it. It is a full reset, prefs included — durations return to 25/5 and the theme to system default — because "clear all data" that quietly kept some data would be a lie. The removes are targeted rather than a blanket `localStorage.clear()`, since the app may not be the only thing on the origin. Unlike "Clear log" and "Clear archive", the button is always offered: knowing whether anything is left to delete would mean reading storage from a component.
- **Settings** holds the work and break durations, the light/dark toggle, and the Data block. Like the archive and audit log it is a **view toggle**, not a machine state, so it never lands in `paradone:activeSession`. Unlike them it is reached from a gear button in the app header, which sits outside the state machine and is therefore present in *every* state — that is what keeps the theme switchable mid-session. It replaces whatever is on screen and is dismissed with "Back", and it closes itself when the machine advances so a block ending behind it can't swallow the "take the break, keep going, or wrap up?" prompt. Durations are read when a timer is created, so editing them mid-block affects the next block, never the running one.
- **Discarding a session** is the third answer at Audit, alongside answering and skipping: the block was interrupted, or never really happened, and logging it would only make the log something the user has to mentally filter. Behind a confirm dialog — it cannot be undone — it writes **nothing** to `paradone:sessions`, clears `paradone:activeSession`, and drops straight back to Setup. This is what separates it from **Skip**, which still logs the block and marks the audit as skipped. Ticked tasks stay ticked — including ones ticked on the Audit screen itself, which are committed on the way out: the Task List is persistent and cross-session, so a checked box is work state, not session state, and rolling it back would also lose tasks added mid-block. The capture text goes with the session, as it does on any return to Setup.
- **Audit log** is a read-only view of every past audit, newest first, reached from a "View log" button at Setup and dismissed with "Back". It is not a machine state — it's a view toggle, so it never lands in `paradone:activeSession`. Each entry shows timestamps, planned/actual duration, focus rating and audit notes; skipped audits are listed and marked as such. One "Download log" button exports the whole log as markdown — there is no per-entry download. A "Clear log" button — offered only when there is something to clear, and confirmed in a dialog — empties `paradone:sessions`; there is no per-entry delete. The session record is appended when the audit is answered or skipped, *not* when the user starts the next session, so closing the tab at Summary cannot lose an audit. Chronological only — aggregates and trends stay deferred (§6).

## 4. Data model

```js
// paradone:prefs
{
  workDuration: 25,      // minutes, user-editable
  breakDuration: 5,      // minutes, user-editable; 0 = no breaks
  theme: "light",        // "light" | "dark"; seeded once from the OS, then fixed
  addTaskKey: "n",       // single lowercase letter opening the Add Task modal; "" = shortcut off
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
  addedTasks: ["reply to Mai"],       // on the list at the end but not at the start, ticked or not; absent on records written before this existed
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
- This same component is instantiated across every state that shows the Task List (Setup, Active, Audit), editable (add/edit/delete + toggle) in all three. An `archivable` prop is what separates Setup from the other two: it gates the archive sweep alone, so Active and Audit get every control except that one. Setup and Active bind it straight to the one persistent `paradone:goalsList` store, and Active hides the pre-checked tasks through a display-only `hiddenHashes` prop rather than by passing a filtered string: the bound value stays the whole list, so a toggle writes back every line rather than deleting the hidden ones. Audit is the exception in *what* it binds — a **frozen draft** taken when the screen opens, so a change rewrites the draft instead of the store and the rows hold still. That draft is the whole list with the already-checked lines hidden by the same `hiddenHashes` prop, not stripped out of the string: it stays a complete, well-formed Task List, so add/edit/delete need no merge logic and adding a task can't quietly delete the work the block just completed. Finishing the audit writes the draft back **whole**, through the same single Task List funnel every other write uses.

## 5. Constraints

**Non-negotiable:**
- **Frontend: Vue 3.5.x + Vite.** `<script setup>` SFCs. Not Vue 3.6 / Vapor Mode — still beta at time of writing. Stack deliberately matches Cheqist (Vue 3.5, Vite, Pinia) for maintainer sanity; scope stays separate regardless.
- Ships as a **static Vite build** (`vite build` → `dist/`) deployed on GitHub Pages. **No backend, ever** — no API calls, no auth, no accounts, no server-side persistence. Vue/Pinia are the only runtime deps in the bundle.
- All state in `localStorage`. Nothing leaves the browser. This is a *feature* — "no account, no tracking, your data stays on your device" is the positioning, not a limitation.
- **Testing: Vitest + `@vue/test-utils`.** Dev-only; never shipped. Pure logic (parser, storage, timer math) gets unit tests; components get mounted tests.
- Export is markdown, generated client-side. The whole-app backup is JSON, also generated client-side — a file the user downloads and picks back up, never an upload.

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
| `AuditPrompt.vue` | The required focused/distracted/mixed quick-select, plus optional free-text notes on the block |
| `SessionSummary.vue` | Assembles markdown, copy + download |
| `SessionLog.vue` | Read-only list of past audits, newest first, + download-whole-log, + clear-log |
| `ArchiveView.vue` | Read-only list of archived tasks with completion times, newest first, + download-archive, + clear-archive |
| `ConfirmDialog.vue` | Native `<dialog>` confirmation gating a destructive action |
| `SettingsPanel.vue` | Work/break durations; stored separately from session data. Rendered in the Settings view, alongside `ThemeToggle.vue` |
| `DataPanel.vue` | Export/import/clear buttons, the hidden file input, validation errors, and the replace-everything and clear-all-data confirmations. Rendered in the Settings view |

**Logic modules (plain `.js`, unit-tested, no component mounting):**

| Module | Owns |
|---|---|
| `storage.js` | All `localStorage` read/write. Nothing else touches storage directly |
| `checklist.js` | Markdown parse, content-hash keying, toggle-rewrite. The parser lives here, not in the component |
| `timer.js` | Countdown/tick math, duration calculations |
| `sessionLog.js` | Audit-log sorting, date/time formatting, log markdown generation |
| `archive.js` | Tick-time bookkeeping, the archive sweep, archive markdown generation |
| `download.js` | Blob-and-anchor file download, shared by the markdown exports and the JSON backup |
| `backup.js` | Whole-app backup: build the versioned envelope, validate a picked file, restore it. Goes through `storage.js` like everything else |

Keeping logic out of the SFCs is deliberate — it's what makes the tricky parts testable with plain Vitest instead of mounted-component tests.

## 8. Acceptance criteria

- [ ] Timer defaults to 25/5; both durations editable in the Settings view and persisted
- [ ] The Settings view is reachable from the header gear in every state, replaces the current screen, returns with "Back", and closes itself when the session machine advances
- [ ] Light/dark toggle lives in the Settings view, which is reachable in every state, applies immediately, and persists to `paradone:prefs`; on first load it takes the OS preference, and after that the stored choice wins with no flash of the wrong palette on reload
- [ ] Break duration of 0 skips the break state entirely
- [ ] Task List persists across page reloads and across sessions
- [ ] At Setup, tasks can be added via the Add-Task modal, edited, and deleted, and each change persists to `paradone:goalsList`
- [ ] Checkboxes in the Task List are clickable and persist their state, both at Setup and during an active session
- [ ] An active session hides the tasks already checked when it started, keeps ones ticked during the block on screen, and still persists the hidden tasks when a visible one is toggled
- [ ] "Archive completed" at Setup removes every checked task from the Task List and persists them to `paradone:archive`, leaving unchecked and plain lines in place
- [ ] An archived task records the time its checkbox was ticked — surviving a reload between the tick and the sweep — not the time it was archived
- [ ] The archive view lists archived tasks newest-first with their completion times, and downloads in full as one markdown file
- [ ] "Clear archive" empties `paradone:archive.archived` after a confirmation dialog, leaves the tick-time map and the Task List untouched, and survives a reload
- [ ] Capture box is reachable in every active state without leaving the timer
- [ ] Reloading the page mid-session restores the running block from `paradone:activeSession`
- [ ] At block end, user can choose break, continue, or end the session
- [ ] "Keep going" starts another work block immediately, in the same session — planned and actual duration accumulate across chained blocks into one log record
- [ ] Focused time so far — work blocks only, excluding breaks and paused time — is shown at the block-end choice and under the running timer
- [ ] The audit and summary screens both open with that same focused time, and the exported summary markdown carries it as a Focused time line
- [ ] An in-progress break can be ended early; both that and letting it run out return to the block-end choice, reading "Break complete" rather than "Block complete"
- [ ] "Keep going" after a break chains another block onto the same session, the audit only arriving when the user picks "End session"
- [ ] "Take a break" at the Summary runs a break countdown that returns to Setup, whether it runs out or is ended early — the session is already logged, so there is nothing to chain onto
- [ ] The Summary's "Take a break" is hidden when the break duration is 0
- [ ] The Capture box is hidden during a break taken from the Summary
- [ ] Audit prompt shows the unchecked remainder of the Task List alongside the questions; checked tasks appear only under Completed this session
- [ ] Tasks on the audit list can still be ticked; a ticked row stays on screen, checked, and does not move to Completed this session until the audit is finished
- [ ] A task ticked at the audit persists to `paradone:goalsList` once the audit is answered or skipped, and appears both under Completed this session on the Summary and in the logged session's `completedTasks`
- [ ] A task ticked at the audit and then unticked before finishing is not recorded as completed
- [ ] Tasks on the audit list can also be added, edited and deleted; like a tick, the change reaches `paradone:goalsList` only once the audit is answered, skipped or discarded, and it leaves the tasks completed during the block on the list
- [ ] A task added at the audit and ticked there counts as completed and as added: it lands in `paradone:goalsList`, is badged `added` under Completed this session on the Summary, and appears in the logged session's `completedTasks` and `addedTasks`
- [ ] Audit prompt lists the tasks ticked during the block — not ones already checked before it started — and omits the section entirely when there were none
- [ ] The Completed this session and Captures sections are hidden at both Audit and Summary when nothing was completed or captured, while the markdown export still emits both headings with their placeholder lines
- [ ] Audit notes are optional: the Notes line is dropped from the Summary when an answered audit has none, while both markdown exports still emit their `_(none noted)_` placeholder
- [ ] During an active session a task can be added through the Add-Task modal, edited and deleted; it persists to `paradone:goalsList`, is tickable in the same block, and survives a mid-block reload
- [ ] "Archive completed" is the one Setup control absent during an active session
- [ ] A completed task that was added mid-session is badged `added` at the Audit, on the Summary and in the audit log, while one that pre-existed the block is not; the same rows carry an `(added mid-session)` suffix in both markdown exports
- [ ] Pressing the add-task key outside a text field opens the Add Task modal at Setup, during an active session and at the Audit, and does nothing while typing in the Capture box or the audit notes
- [ ] The add-task key is editable in the Settings view and persisted; it defaults to `n`, accepts a single letter (stored lowercase), rejects anything else, and clearing the field disables the shortcut
- [ ] The logged session's `addedTasks` holds every task added during the block, including ones left unticked, and a record written without the field renders and exports without annotating anything
- [ ] Summary shows no Task List, and exports valid markdown containing the completed-this-session list, capture notes, and audit answers
- [ ] Audit log entries list the tasks completed in that block, on screen and in the log export
- [ ] Every audit is appended to `paradone:sessions` the moment it is answered or skipped, and survives closing the tab at Summary
- [ ] "Discard session" at Audit, after a confirmation dialog, writes nothing to `paradone:sessions`, clears the in-flight session, and returns to Setup with tasks ticked during the block — and at the audit — left ticked
- [ ] The audit log lists all past audits newest-first with date/time stamps, and downloads in full as one markdown file
- [ ] "Clear log" empties `paradone:sessions` after a confirmation dialog and survives a reload
- [ ] "Export data" in Settings downloads one dated JSON file containing prefs, the Task List, the session log, and the archive
- [ ] "Import data" validates the file, warns before replacing, and restores every entity exactly; a file that is not a Paradone backup shows an error and changes nothing
- [ ] Importing clears any session in progress, leaving the app at Setup after the reload
- [ ] "Clear all data" removes every `paradone:*` key after a confirmation dialog, and the app comes back at Setup with default settings
- [ ] App functions with zero network requests after initial page load
- [ ] `checklist.js` has unit tests: checkbox parse, plain-line passthrough, toggle-rewrite, add/remove/edit-item, hash stability across line reorder, completed-since diff
- [ ] `storage.js` has a round-trip test (write → read → deep-equal) for each entity
- [ ] `vite build` produces a `dist/` that runs correctly when served as static files
- [ ] CI runs `vitest run` and blocks deploy on failure
- [ ] Vite `base` is `'/'` (apex domain paradone.com) and a `CNAME` file with `paradone.com` ships in the build output
