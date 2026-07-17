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

There is no routing. One page, seven states.

| State | Purpose |
|---|---|
| **Setup** | Task List (persistent, editable, checkbox-aware) + duration settings + optional 2-minute primer link + Start |
| **Primer** *(optional)* | 2-minute timer, then: commit to a full session, or stop here |
| **Active** | Countdown, task list rendered with live checkboxes (toggle-only, no textarea), capture box always available |
| **Block end** | Bell → "take the break, or keep going?" |
| **Break** *(skippable)* | Break countdown |
| **Audit** | What actually got done? Focused or distracted? Shown alongside the current task list |
| **Summary** | Compiled markdown (task list, captures, audit), copy or download, start new session |

### Screen behaviours

- **Task List** is a single freeform markdown checklist, persistent across sessions. It's editable via textarea at Setup; during Active it's checkbox-toggle-only (no textarea). The same list is shown read-only at Audit and Summary, and whatever the list contains at the moment a session ends *is* the export content — a full snapshot, not a per-session diff.
- **Capture box** is pinned and available in every active state. Entries are timestamped and queue for review at audit time — never triaged mid-block.
- **2-minute primer** is optional and skippable. Surfaced as a "need help starting?" affordance, never a required gate.

## 4. Data model

```js
// paradone:prefs
{
  workDuration: 25,      // minutes, user-editable
  breakDuration: 5,      // minutes, user-editable; 0 = no breaks
}

// paradone:goalsList  — the single persistent Task List, cross-session
{
  text: "- [ ] draft outline\n- [x] send invoice\n- ideas for post",
  updatedAt: "2026-07-13T09:00:00Z"
}

// paradone:sessions  — append-only array
[{
  id: "uuid",
  date: "2026-07-13T09:15:00Z",
  taskListText: "- [ ] draft outline\n- [x] send invoice",   // full Task List snapshot at session end
  plannedDuration: 25,
  actualDuration: 25,
  captures: [{ text: "reply to Mai re: weekend", timestamp: "..." }],
  usedPrimer: false,
  auditProductive: "focused" | "distracted" | "mixed",
  auditNotes: "got the outline done, tabbed out twice"
}]

// paradone:activeSession  — in-progress session, so a page reload doesn't lose the block
```

### Markdown parsing (the fiddly part)

The **source of truth is a raw markdown string**, not a structured array. Parse it into line-items on render so `- [ ]` lines become clickable checkboxes; clicking one rewrites the underlying string and re-saves.

- Item identity keys on a **content hash of the line**, not line index — so hand-editing the raw text doesn't attach a checked box to the wrong line.
- Non-checkbox lines (plain bullets, free text) render as-is and are simply not clickable.
- This same component is instantiated across every state that shows the Task List (Setup, Active, Audit, Summary), always bound to the one persistent `paradone:goalsList` store — editable at Setup, toggle-only at Active, read-only at Audit/Summary.

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
- "Clear checked items" on the Task List (until then it grows unbounded — accepted for v1)
- Focus-debt counter and cross-session trend view
- Desktop app (floating always-on-top timer, global keyboard shortcut for distraction capture) — this is the intended **paid** tier
- PWA / offline install

## 7. Components

**Components (`.vue`):**

| Component | Owns |
|---|---|
| `TimerDisplay.vue` | Countdown render (mm:ss), visually distinct primer vs. session states |
| `MarkdownChecklist.vue` | Parse → render → toggle → write-back. Bound to the single persistent Task List, reused across Setup/Active/Audit/Summary |
| `CaptureBox.vue` | Persistent input + timestamped running list |
| `AuditPrompt.vue` | Two questions: what got done, focused/distracted/mixed. Quick-select + optional free text |
| `SessionSummary.vue` | Assembles markdown, copy + download |
| `SettingsPanel.vue` | Work/break durations; stored separately from session data |

**Logic modules (plain `.js`, unit-tested, no component mounting):**

| Module | Owns |
|---|---|
| `storage.js` | All `localStorage` read/write. Nothing else touches storage directly |
| `checklist.js` | Markdown parse, content-hash keying, toggle-rewrite. The parser lives here, not in the component |
| `timer.js` | Countdown/tick math, duration calculations |

Keeping logic out of the SFCs is deliberate — it's what makes the tricky parts testable with plain Vitest instead of mounted-component tests.

## 8. Acceptance criteria

- [ ] Timer defaults to 25/5; both durations editable and persisted
- [ ] Break duration of 0 skips the break state entirely
- [ ] Task List persists across page reloads and across sessions
- [ ] Checkboxes in the Task List are clickable and persist their state, both at Setup and during an active session
- [ ] Capture box is reachable in every active state without leaving the timer
- [ ] Reloading the page mid-session restores the running block from `paradone:activeSession`
- [ ] At block end, user can choose break or continue
- [ ] Audit prompt shows the current Task List alongside the questions
- [ ] Summary exports valid markdown containing the Task List snapshot, captures, and audit answers
- [ ] App functions with zero network requests after initial page load
- [ ] `checklist.js` has unit tests: checkbox parse, plain-line passthrough, toggle-rewrite, hash stability across line reorder
- [ ] `storage.js` has a round-trip test (write → read → deep-equal) for each entity
- [ ] `vite build` produces a `dist/` that runs correctly when served as static files
- [ ] CI runs `vitest run` and blocks deploy on failure
- [ ] Vite `base` is `'/'` (apex domain paradone.com) and a `CNAME` file with `paradone.com` ships in the build output
