# Native Touch Scrolling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep scrolling fully native on touch-first devices while preserving the existing narrative auto-scroll on fine-pointer laptops and desktops.

**Architecture:** Add one exported capability predicate beside `NarrativeScroll` and use it as an early lifecycle gate before any motion setup, class mutation, waypoint work, or event registration. Detect the input model with `navigator.maxTouchPoints` plus `(hover: none) and (pointer: coarse)`, never viewport width or user agent.

**Tech Stack:** React 19, TypeScript 6, Vitest, Testing Library, GSAP, Vite.

## Global Constraints

- Touch-first devices get native document scrolling with no narrative listeners or automatic landings.
- Fine-pointer desktop/laptop behaviour must remain unchanged at every viewport width.
- Hybrid touch laptops retain narrative scrolling when their primary pointer is fine and hover-capable.
- Reduced motion remains an independent native-scrolling escape hatch.
- Do not remove responsive waypoint markup; it still serves narrow fine-pointer windows.
- Do not change scroll thresholds, gesture epochs, easing, durations, or authored destinations.

---

### Task 1: Prove the input-capability boundary

**Files:**
- Modify: `src/components/NarrativeScroll.test.tsx`
- Modify: `src/components/NarrativeScroll.tsx`
- Create: `src/narrativeScrollCapabilities.ts`

**Interfaces:**
- Produces: `TOUCH_FIRST_INPUT_QUERY` and `shouldUseNativeTouchScrolling(maxTouchPoints, touchFirstPrimaryInput)`.
- Consumes: `navigator.maxTouchPoints` and `window.matchMedia`.

- [x] **Step 1: Write failing predicate and component lifecycle tests**

Add focused tests for the three predicate combinations and two component modes:

```ts
expect(shouldUseNativeTouchScrolling(5, true)).toBe(true)
expect(shouldUseNativeTouchScrolling(5, false)).toBe(false)
expect(shouldUseNativeTouchScrolling(0, true)).toBe(false)
```

In a touch-first environment, render `NarrativeScroll` and assert that `narrative-scroll-active` is absent and narrative wheel, touch, and delegated click listeners are not registered. In a narrow fine-pointer environment, assert that the class and wheel listener are still registered.

- [x] **Step 2: Run the focused tests and verify RED**

Run: `npm test -- --run src/components/NarrativeScroll.test.tsx`

Expected: the test module fails because the predicate is not exported and the component currently mounts on touch-first input.

- [x] **Step 3: Implement the minimal capability gate**

Export the query and predicate, then update the effect guard:

```ts
if (
  window.matchMedia(REDUCED_MOTION_QUERY).matches ||
  shouldUseNativeTouchScrolling()
) return
```

The default predicate parameters read the current navigator and media-query values. No listener is needed for capability changes because the primary input model is stable for the page session; a reload naturally re-evaluates it.

- [x] **Step 4: Run the focused tests and verify GREEN**

Run: `npm test -- --run src/components/NarrativeScroll.test.tsx`

Expected: the new capability tests and all existing narrative component tests pass without warnings.

### Task 2: Make the rule permanent design language

**Files:**
- Modify: `docs/design-language/scroll-choreography.md`

- [x] **Step 1: Update the scope and input contract**

Record that the narrative director is fine-pointer only, touch-first devices never mount it, responsive mobile waypoints remain for narrow fine-pointer layouts, and wheel/trackpad are the only controlled physical input streams.

- [x] **Step 2: Update safeguards, tests, and release checks**

Remove touch rollback/commit requirements for phones/tablets. Replace them with native swipe, momentum, pinch, anchor, and no-active-class checks. Add a known-failure row prohibiting width or user-agent detection.

### Task 3: Verify and publish

**Files:**
- Verify: repository and production browser behaviour

- [x] **Step 1: Run the complete automated gate**

Run:

```bash
npm test -- --run
npm run lint
npm run build
git diff --check
```

- [x] **Step 2: Verify both browser modes**

Confirm desktop fine-pointer emulation adds `narrative-scroll-active`. Confirm mobile touch emulation reports touch points, matches the touch-first query, omits the active class, and allows native document movement.

- [x] **Step 3: Commit and publish to main**

Commit the scoped files, push the verified commit to `origin/main`, fetch, confirm `origin/main` equals the local commit, and inspect the deployment status signal before reporting completion.
