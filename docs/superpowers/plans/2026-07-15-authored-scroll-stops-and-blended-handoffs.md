# Authored Scroll Stops and Blended Handoffs Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Make every wheel, trackpad, and touch gesture settle only on an authored complete composition, while blending the manual preview smoothly into forward and return animations.

**Architecture:** Keep the existing native-document gesture director and GSAP adapter. Simplify waypoint construction to authored declarations only, let the director distinguish `continue`, `return`, and `direct` handoffs, and make the browser adapter follow preview targets with a time-based exponential filter before animating from the actually rendered scroll position.

**Tech Stack:** TypeScript, React 19, GSAP 3, Vitest, Testing Library, Vite.

---

### Task 1: Make the waypoint map authored-only

**Files:**

- Modify: `src/narrativeScroll.test.ts`
- Modify: `src/components/NarrativeScroll.test.tsx`
- Modify: `src/narrativeScroll.ts`
- Modify: `src/narrativeScrollDom.ts`

**Step 1: Write the failing regression tests**

Replace the continuation-generation assertions with an authored-only contract:

```ts
it('keeps only authored waypoints across a large narrative gap', () => {
  expect(
    buildWaypointMap(
      [
        { id: 'proof', y: 0 },
        { id: 'process-heading', y: 1_800 },
      ],
      2_000,
    ).map(({ id }) => id),
  ).toEqual(['proof', 'process-heading'])
})
```

In the DOM collector suite, retain a tall `data-scroll-scene` wrapper but assert that its returned IDs are only `chapter-start` and `chapter-end`. This proves labels or empty geometry cannot become stops even when a chapter is much taller than the viewport.

**Step 2: Run the focused tests and confirm the intended failure**

Run:

```bash
npm test -- --run src/narrativeScroll.test.ts src/components/NarrativeScroll.test.tsx
```

Expected: failure because `buildWaypointMap` still emits `--continuation-*` IDs and still accepts viewport/scene generation inputs.

**Step 3: Remove geometry-generated destinations**

In `src/narrativeScroll.ts`:

- delete `ScrollSceneSpan` and `MAXIMUM_GAP_RATIO`;
- change `buildWaypointMap(points, maxY)` to only filter non-finite points, clamp to `[0, maxY]`, sort by position/priority, and deduplicate within four CSS pixels;
- return the deduplicated authored array directly.

In `src/narrativeScrollDom.ts`:

- remove scene-span measurement and the `ScrollSceneSpan` import;
- keep `data-scroll-scene` in component markup as semantic chapter inventory, but do not read it for waypoint generation;
- call `buildWaypointMap(points, maxScrollY)`.

**Step 4: Run the focused tests**

Run:

```bash
npm test -- --run src/narrativeScroll.test.ts src/components/NarrativeScroll.test.tsx
```

Expected: PASS, including physical, virtual, horizontal-track, responsive, and authored-only gap tests.

**Step 5: Commit the authored-stop correction**

```bash
git add src/narrativeScroll.ts src/narrativeScrollDom.ts src/narrativeScroll.test.ts src/components/NarrativeScroll.test.tsx
git commit -m "fix: keep narrative stops authored"
```

### Task 2: Add damped previews and handoff modes to the director

**Files:**

- Modify: `src/narrativeScroll.test.ts`
- Modify: `src/narrativeScroll.ts`

**Step 1: Extend the test harness before changing production behavior**

Record animation requests as both destinations and modes without removing existing destination assertions:

```ts
const animationModes: HandoffMode[] = []

animate: ({ to, mode, onComplete }) => {
  animations.push(to)
  animationModes.push(mode)
  // preserve existing completion behavior
}
```

Add failing tests that establish:

- `wheelPreviewDistance(80, 600) === 44` while an 80px raw gesture commits at a 72px threshold;
- `touchPreviewDistance(80, 600) === 57.6` while raw touch travel controls commitment;
- committed wheel and touch handoffs request `continue`;
- a quiet sub-threshold wheel and a short/cancelled touch request `return`;
- `goTo` and geometry reconciliation request `direct`;
- `returnDuration` clamps to the `380–580ms` range;
- exponential preview interpolation produces effectively the same position for one 16ms frame and two 8ms frames.

**Step 2: Run the director tests and confirm failure**

Run:

```bash
npm test -- --run src/narrativeScroll.test.ts
```

Expected: type/test failures because handoff modes, damped preview helpers, return timing, and time-based interpolation do not exist yet.

**Step 3: Add the pure motion contract**

In `src/narrativeScroll.ts`, add:

```ts
export type HandoffMode = 'continue' | 'return' | 'direct'

export type AnimationRequest = {
  to: number
  duration: number
  mode: HandoffMode
  onComplete: () => void
}

export function wheelPreviewDistance(rawIntent: number, targetDistance: number) {
  return Math.min(rawIntent * 0.55, targetDistance)
}

export function touchPreviewDistance(rawTravel: number, targetDistance: number) {
  return Math.min(rawTravel * 0.72, targetDistance)
}

export function returnDuration(distance: number) {
  return clamp(380, 340 + Math.abs(distance) * 1.6, 580)
}

export function previewFollowPosition(
  current: number,
  target: number,
  elapsedMs: number,
) {
  const progress = 1 - Math.exp(-Math.max(0, elapsedMs) / 55)
  return current + (target - current) * progress
}
```

Retain `handoffDuration` for `continue` and `direct` modes.

**Step 4: Route each interaction through the correct motion mode**

- Use raw accumulated wheel intent for threshold/adjacent-distance commitment, but `wheelPreviewDistance` for the visible preview.
- Use raw finger travel for touch commitment, but `touchPreviewDistance` for the visible preview.
- Change `animateTo` to accept a mode and select `returnDuration` only for `return`.
- Request `continue` for committed wheel/touch gestures.
- Request `return` for wheel quiet rollback, touch end below threshold, and touch cancel.
- Request `direct` for `goTo` and geometry reconciliation.
- Preserve one-adjacent-stop targeting, momentum disarming, reversal settlement, and semantic target re-resolution.

**Step 5: Run the director suite**

Run:

```bash
npm test -- --run src/narrativeScroll.test.ts
```

Expected: PASS for the new damping/mode tests and all existing gesture safety regressions.

**Step 6: Commit the director motion contract**

```bash
git add src/narrativeScroll.ts src/narrativeScroll.test.ts
git commit -m "feat: blend narrative gesture handoffs"
```

### Task 3: Smooth preview rendering and preserve the visible handoff position

**Files:**

- Modify: `src/components/NarrativeScroll.tsx`
- Modify: `src/components/NarrativeScroll.test.tsx`

**Step 1: Add failing adapter-level assertions**

Add tests with mocked `requestAnimationFrame`, `window.scrollTo`, and GSAP animation requests that prove:

- a queued preview approaches its target over multiple time-stamped frames instead of writing the complete preview distance on its first frame;
- starting an animation cancels the pending preview frame without writing its pending target;
- the GSAP proxy starts at the current rendered `window.scrollY`;
- `continue`, `return`, and `direct` map to `power1.out`, `sine.inOut`, and `power3.inOut` respectively.

If the component harness makes direct GSAP inspection brittle, export and unit-test a small `handoffEase(mode)` helper from `NarrativeScroll.tsx`, while keeping `previewFollowPosition` covered as the time-based mathematical contract in `narrativeScroll.test.ts`.

**Step 2: Run the adapter tests and confirm failure**

Run:

```bash
npm test -- --run src/components/NarrativeScroll.test.tsx
```

Expected: failure because the adapter currently coalesces to a one-frame write and calls `flushScroll()` before every animation.

**Step 3: Replace one-frame flushing with a 55ms follower**

In `src/components/NarrativeScroll.tsx`:

- maintain the latest `pendingScrollY`, last frame timestamp, and animation-frame ID;
- on each frame, calculate the next rendered position with `previewFollowPosition(current, target, elapsedMs)`;
- schedule another frame until the target is within `0.5px`, then write the exact target and clear follower state;
- let later wheel/touch events update the pending target without starting duplicate frame loops;
- make `writeScrollImmediately` cancel the follower before its synchronous write.

**Step 4: Start GSAP from what the visitor actually saw**

Before a handoff:

- cancel the pending preview frame and discard its target;
- do not flush the pending target into the document;
- initialise the GSAP proxy from `window.scrollY`;
- select easing through `handoffEase(request.mode)`.

Keep the existing scroll update, ScrollTrigger update, completion, cancellation, and unmount cleanup behavior.

**Step 5: Run the adapter and director tests**

Run:

```bash
npm test -- --run src/narrativeScroll.test.ts src/components/NarrativeScroll.test.tsx
```

Expected: PASS.

**Step 6: Commit the browser handoff adapter**

```bash
git add src/components/NarrativeScroll.tsx src/components/NarrativeScroll.test.tsx
git commit -m "feat: smooth narrative scroll previews"
```

### Task 4: Update the permanent scroll design language

**Files:**

- Modify: `docs/design-language/scroll-choreography.md`

**Step 1: Replace continuation rules with the authored-composition rule**

Document that:

- `data-scroll-scene` identifies chapter ownership and structural inventory only;
- geometry must never create destinations;
- section eyebrows, labels, decorative assets, and partial card frames are never stops;
- a contributor marks every complete headline, state, card, bridge, Contact, and full Footer composition explicitly;
- Systems track waypoints move directly from one complete card to the next.

**Step 2: Document preview and handoff motion**

Add the permanent values from the approved design:

- wheel preview `55%`, touch preview `72%`;
- raw input controls the unchanged commitment thresholds;
- preview follows its target using a time-based `55ms` filter and settles within `0.5px`;
- `continue`: `power1.out`, adaptive `520–980ms`;
- `return`: `sine.inOut`, adaptive `380–580ms`;
- `direct`: `power3.inOut`, adaptive `520–980ms`;
- reduced-motion remains native.

**Step 3: Update the test and release checklists**

Remove references to the `82vh` rule. Require walking the actual authored stop IDs and explicitly checking label-only frames, every full Systems card, Contact-to-full-Footer, short rollback motion, mobile touch sizes, and the `900px` breakpoint.

**Step 4: Validate the documentation and commit**

Run:

```bash
rg -n "82vh|continuation|one-to-one" docs/design-language/scroll-choreography.md
git diff --check
```

Expected: no obsolete continuation or one-to-one preview rule; no whitespace errors.

```bash
git add docs/design-language/scroll-choreography.md
git commit -m "docs: define authored scroll choreography"
```

### Task 5: Complete automated and real-browser verification

**Files:**

- Verify: `src/**/*.test.ts`
- Verify: `src/**/*.test.tsx`
- Verify: `dist/`

**Step 1: Run the complete automated gates**

Run:

```bash
npm test -- --run
npm run lint
npm run build
git diff --check
git status --short
```

Expected: all tests pass, lint/build succeed, diff check is clean, and only intentional source/documentation changes appear before their commits.

**Step 2: Replace the localhost build**

Use the existing preview server on port `4173` if it is healthy after rebuilding `dist`; otherwise stop only that worktree's stale preview process and start:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

Confirm `http://127.0.0.1:4173/` returns the rebuilt site.

**Step 3: Verify authored stops on desktop**

At a desktop viewport, inspect the resolved waypoint IDs and gesture through them in both directions. Confirm:

- Proof advances directly to the full Process headline;
- no stop consists only of `// How I work`, `// The method`, `// Working systems`, `// Inside the system`, or `JA / DATA`;
- `system-01` advances directly to the complete `system-02`, and likewise for every System card and the bridge;
- Contact advances to the full Footer;
- one extreme delta cannot advance twice;
- a short gesture eases back and a committed gesture begins from the rendered preview without a snap;
- no console error, Vite overlay, or horizontal overflow appears.

**Step 4: Verify touch and responsive reconstruction**

Repeat the authored-stop walk with claimed touch gestures at `390x844`, `375x812`, and `320x568`. Cross and rotate through the `900px` breakpoint and confirm mobile physical scenes replace desktop virtual/pinned destinations without skipped or duplicate stops.

**Step 5: Request an independent implementation review**

Use `superpowers:requesting-code-review` against the final branch diff. Address any critical or important finding, then rerun the affected tests and the complete verification gates.

**Step 6: Hand off localhost**

Keep the verified localhost tab as the deliverable and tell the user to refresh `http://localhost:4173/`.
