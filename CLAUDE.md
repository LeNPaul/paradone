# CLAUDE.md — Paradone Focus Timer

## What this is

A static, no-backend deep work timer with an intention-vs-reality audit loop. Hosted free on GitHub Pages at paradone.com.

**The full spec is in `spec.md`. Read it before planning any feature work.** This file is the rulebook; the spec is the blueprint.

---

# Part 1 — Behavioral guidelines

*Bias toward caution over speed. For trivial tasks, use judgment.*

## 1. Think before coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity first

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical changes

**Touch only what you must. Clean up only your own mess.**

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.
- Remove imports/variables/functions that *your* changes made unused. Leave pre-existing dead code alone unless asked.

The test: every changed line should trace directly to the request.

## 4. Goal-driven execution

**Define success criteria. Loop until verified.**

This project uses **Vitest** (+ `@vue/test-utils`). "Verify" means a passing test for anything with logic; a concrete manual check for pure DOM/visual behaviour where a test isn't worth the setup.

Transform tasks into verifiable goals:

- "Add the markdown parser" → "Write tests: checkbox lines parse, plain lines pass through, toggling rewrites the string. Then make them pass."
- "Persist the goals list" → "Test the storage round-trip (write → read → deep-equal). Then verify manually: type a goal, hard-reload, goal is still there."
- "Fix the checkbox bug" → "Write a test that reproduces it (reorder lines, assert checked state stays with the right content hash), then make it pass."

Pure logic (parser, storage, timer math) gets unit tests. Components get `@vue/test-utils`. Visual-only behaviour gets a manual check.

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [concrete check]
2. [Step] → verify: [concrete check]
```

Weak criteria ("make it work") require constant clarification. Strong ones let you loop independently.

---

# Part 2 — Project constraints

## Non-negotiable

Hard rules. Do not plan or write anything that violates them — flag the conflict instead.

1. **No backend. Ever.** No API calls, no fetch to any server, no auth, no accounts, no server-side persistence. If a feature seems to need a backend, it does not belong in this project.
2. **All state in `localStorage`.** Nothing leaves the browser. Privacy is the product positioning, not an afterthought.
3. **Frontend is Vue 3.5.x + Vite.** Use `<script setup>` single-file components. Do NOT use Vue 3.6 / Vapor Mode — it is still beta as of this writing. Do not add another framework alongside Vue.
4. **No new *runtime* dependencies without asking.** The browser bundle is the app + Vue (+ Pinia if state needs it) and nothing else. Do not pull in libraries for things the platform or Vue already handle (markdown parsing, UUIDs via `crypto.randomUUID()`, date formatting). Dev-only tooling (Vite, Vitest, `@vue/test-utils`, a linter) is fine and must never ship to the browser.
5. **No AI/LLM calls.** The honesty/audit mechanic is UI and logic, not inference.
6. **Deploys as a static Vite build to GitHub Pages at the apex domain paradone.com.** `vite build` → `dist/` → Pages. No backend, no server-side anything. CI is a single Action: install, test, build, deploy. Vite `base` stays `'/'` (the default — apex domain, not a project subpath). Add a `CNAME` file containing `paradone.com` to the deployed output so Pages keeps the custom domain across deploys.

## Scope fences

The Task List is a **flat markdown checklist**. It does not get due dates, projects, priority levels, tags, or sorting. If a request would add any of those, stop and flag it — that functionality belongs in a different product, not here.

There is a single persistent Task List (the former Goals List and Session Goal field are merged). It's editable at Setup, checkbox-toggle-only during an active session, and shown read-only at Audit and Summary.

v1 is **countdown only**. No stopwatch/flowtime mode. That is v1.1.

## Architecture conventions

- Single-page state machine. No router — the app is one view with a `state` value driving what renders.
- All `localStorage` access goes through one module (`storage.js` or a Pinia persistence layer). No component reads or writes storage directly.
- Keep parsing/timer/storage logic in **plain `.js` modules**, not buried inside components. That is what stays unit-testable without mounting anything.
- Storage keys are namespaced: `paradone:prefs`, `paradone:goalsList`, `paradone:sessions`, `paradone:activeSession`.
- The markdown checklist source of truth is a **raw string**, parsed on render. Item identity keys on a content hash of the line, never on line index.
- One component (`MarkdownChecklist.vue`) serves the single persistent Task List everywhere it's shown (Setup, Active, Audit, Summary). Do not write two.
- Use Pinia only if cross-component state genuinely needs it. For a single-view app, a couple of composables may be enough — don't add Pinia reflexively.

## Design

Visual references live in `design/`. The look is Apple-HIG-adjacent: monochrome base, one accent, rounded cards on a light-gray canvas, generous whitespace. Take the references' *visual language*, not their layout — they are multi-pane native apps; Paradone is one column with no sidebar.

- `src/styles/tokens.css` is the only place colors, spacing, type sizes, radii, and shadows are defined. Components reference `var(--…)` and never a literal hex or px value.
- Both light and dark themes are defined there together. A screen is not done until it has been checked in both.
- `src/styles/base.css` styles bare elements, so most components need no CSS of their own. Reach for a scoped `<style>` block only when an element genuinely needs component-specific treatment.
- Don't add a CSS framework, an icon package, or an animation library — the no-new-runtime-dependencies rule applies to styling exactly as it applies to logic.
- **Tests match buttons by their label text and sections by heading id.** Restyle freely, but never change a button's visible string or a heading's `id`. If a label must be visually hidden, keep it in the DOM as an `aria-label`.

## Planning requirements

- Enter Plan Mode before any task touching more than 2 files. Wait for explicit approval before writing code.
- Implement the approved plan as written. Do not add files, patterns, or dependencies the plan did not include.
- Check work against the acceptance criteria in `spec.md` §8 before declaring a task done.

## Style

- Plain, readable JS. Comments explain *why*, not *what*.
- Keep functions short enough to read without scrolling.
