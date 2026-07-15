# Gesture Epochs and Viewport Framing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent one long physical scroll stream from advancing twice while adding full-frame Proof/FAQ landings, restored metric counting, polished Process transitions, a diagnostic evidence trace, and exact headline settling.

**Architecture:** Retain the real-document `NarrativeGestureDirector`, but make its existing wheel session the single-use gesture epoch and remove animation-position-based queue promotion. Add an explicit DOM/CSS viewport-frame declaration for authored full-screen compositions. Keep component motion local: Metrics owns its one-shot counter, Process owns a two-layer crossfade, and the shared motion module supplies exact headline-settling constants.

**Tech Stack:** React 19, TypeScript 6, GSAP 3/ScrollTrigger, CSS, Vitest, Testing Library, Vite.

## Global Constraints

- One physical wheel, trackpad, or touch stream may reach only one adjacent authored waypoint.
- A fresh stream after verified quiet may reserve one adjacent move while a handoff is active.
- No pointer movement or click may be required to rearm input.
- Proof and FAQ are fully isolated desktop viewport compositions; no following surface is visible.
- Preserve the existing scroll durations and sinusoidal handoff easing.
- Preserve mobile physical Process, System, Capability, FAQ, Contact, and Footer destinations.
- Process state motion is opacity-only and honours reduced motion.
- Do not add digit reels, new dependencies, generated spacer stops, blur, skew, or lateral panel motion.

---

### Task 1: One-token wheel gesture epochs

**Files:**
- Modify: `src/narrativeScroll.test.ts`
- Modify: `src/narrativeScroll.ts`
- Modify: `docs/design-language/scroll-choreography.md`

**Interfaces:**
- Consumes: `NarrativeGestureDirector.handleWheel`, the harness `runQuietTimer`, `setRenderedScroll`, and `completeAnimation`.
- Produces: one-session/one-landing wheel behaviour while retaining fresh post-quiet queued intent.

- [ ] **Step 1: Write failing continuous-stream regression tests**

Add tests that keep the same epoch active through the final approach and landing:

```ts
it('absorbs one long wheel epoch through the final approach and landing', () => {
  const harness = createDirectorHarness([0, 600, 1200, 1800], 0, false)

  harness.director.handleWheel(wheelInput(140))
  harness.setRenderedScroll(570)
  harness.director.handleWheel(wheelInput(80))
  harness.completeAnimation()
  harness.director.handleWheel(wheelInput(80))
  harness.director.handleWheel(wheelInput(80))
  harness.runQuietTimer()

  expect(harness.animations).toEqual([600])
})

it('treats a dense line-wheel burst as one landing token', () => {
  const harness = createDirectorHarness([0, 600, 1200], 0, false)

  for (let index = 0; index < 12; index += 1) {
    harness.director.handleWheel(wheelInput(3, 1))
    if (index === 8) harness.setRenderedScroll(570)
  }
  harness.completeAnimation()
  harness.runQuietTimer()

  expect(harness.animations).toEqual([600])
})
```

Keep a separate positive test proving `runQuietTimer()` before a later input creates a fresh epoch and queues `1200` while `600` is still active.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- --run src/narrativeScroll.test.ts`

Expected: the long-stream cases fail because final-20% and post-landing events currently populate `queuedWheel` and animate to `1200`.

- [ ] **Step 3: Remove animation-position queue promotion**

In `NarrativeGestureDirector.handleWheel`:

```ts
if (this.animationActive || this.wheel?.committed || this.wheelDisarmed) {
  input.preventDefault()
  if (this.animationActive && (this.queuedWheel || this.wheelStreamQuiet)) {
    this.captureQueuedWheel(direction, Math.abs(delta))
  }
  this.wheelDisarmed = true
  this.scheduleWheelQuiet()
  return true
}
```

Delete `ACTIVE_LANDING_REMAINING_RATIO`, `activeAnimationOriginY`, `activeAnimationTargetY`, and `isActiveAnimationNearLanding`. Continuous post-commit input only slides the actual quiet boundary; it never becomes fresh intent. Preserve `continueAfterLanding` for a `queuedWheel` that was created after `wheelStreamQuiet` became true.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- --run src/narrativeScroll.test.ts`

Expected: all director tests pass, including fresh queued intent, stationary-pointer rearming, long pixel streams, and line-mode bursts.

- [ ] **Step 5: Commit the gesture epoch change**

```bash
git add src/narrativeScroll.ts src/narrativeScroll.test.ts
git commit -m "fix: enforce one landing per wheel epoch"
```

### Task 2: Full viewport Proof and FAQ frames

**Files:**
- Modify: `src/styles/base.css`
- Modify: `src/styles/hero.css`
- Modify: `src/styles/capabilities-faq.css`
- Modify: `src/components/Metrics.tsx`
- Modify: `src/components/Metrics.test.tsx`
- Modify: `src/components/Faq.tsx`
- Modify: `src/components/Faq.test.tsx`

**Interfaces:**
- Consumes: physical `data-scroll-waypoint` declarations and the fixed `4.25rem` site navigation height.
- Produces: `data-scroll-frame="viewport"` and section-owned `faq-heading` geometry.

- [ ] **Step 1: Write failing structural framing tests**

```ts
expect(container.querySelector('#proof')).toHaveAttribute('data-scroll-frame', 'viewport')
expect(container.querySelector('#faq')).toHaveAttribute('data-scroll-frame', 'viewport')
expect(container.querySelector('#faq')).toHaveAttribute('data-scroll-waypoint', 'faq-heading')
expect(container.querySelector('.faq-header')).not.toHaveAttribute('data-scroll-waypoint')
```

- [ ] **Step 2: Run component tests and verify RED**

Run: `npm test -- --run src/components/Metrics.test.tsx src/components/Faq.test.tsx`

Expected: framing attributes and the section-owned FAQ waypoint are missing.

- [ ] **Step 3: Add the reusable frame and section geometry**

Add `--nav-height: 4.25rem` to `:root`, then:

```css
@media (min-width: 901px) {
  [data-scroll-frame='viewport'] {
    min-height: calc(100svh - var(--nav-height));
  }
}
```

Mark Proof and FAQ with `data-scroll-frame="viewport"`. Move `data-scroll-waypoint="faq-heading"` from `.faq-header` to `#faq`. Give desktop Proof one stretching grid row and give desktop FAQ `align-content: center` while preserving natural growth and sticky behaviour.

- [ ] **Step 4: Run framing tests and verify GREEN**

Run: `npm test -- --run src/components/Metrics.test.tsx src/components/Faq.test.tsx src/components/NarrativeScroll.test.tsx`

Expected: structural and waypoint collection tests pass.

- [ ] **Step 5: Commit viewport framing**

```bash
git add src/styles/base.css src/styles/hero.css src/styles/capabilities-faq.css src/components/Metrics.tsx src/components/Metrics.test.tsx src/components/Faq.tsx src/components/Faq.test.tsx
git commit -m "feat: frame proof and faq landings"
```

### Task 3: Restore metric count-up with the existing rise

**Files:**
- Modify: `src/data.ts`
- Modify: `src/components/Metrics.tsx`
- Modify: `src/components/Metrics.test.tsx`
- Modify: `src/styles/hero.css`

**Interfaces:**
- Produces: `formatMetricCount(value, progress, from?, decimals?)` and `data-count-up-metric` hooks.

- [ ] **Step 1: Write failing formatter and markup tests**

```ts
expect(formatMetricCount('8+', 0)).toBe('0+')
expect(formatMetricCount('8+', 0.5)).toBe('7+')
expect(formatMetricCount('16', 1)).toBe('16')
expect(formatMetricCount('€2M+', 0, 0.5, 1)).toBe('€0.5M+')
expect(formatMetricCount('€2M+', 1, 0.5, 1)).toBe('€2M+')
expect(container.querySelectorAll('[data-count-up-metric]')).toHaveLength(3)
expect(container.querySelectorAll('[data-digit-reel]')).toHaveLength(0)
```

- [ ] **Step 2: Run Metrics tests and verify RED**

Run: `npm test -- --run src/components/Metrics.test.tsx`

Expected: `formatMetricCount` and count-up hooks do not exist.

- [ ] **Step 3: Implement the historical cubic counter**

Parse the numeric portion with `/^([^\d]*)([\d.]+)(.*)$/`, calculate `1 - Math.pow(1 - progress, 3)`, and return the exact final string at progress `1`. Add `{ from: 0.5, decimals: 1 }` to `€2M+`. A `CountUpValue` component uses `requestAnimationFrame` for `2400ms` once `is-visible` is set, while the existing wrapper performs the clipped rise. Add `font-variant-numeric: tabular-nums`.

- [ ] **Step 4: Run Metrics and reduced-motion tests and verify GREEN**

Run: `npm test -- --run src/components/Metrics.test.tsx src/components/App.test.tsx`

Expected: final accessible values remain present, formatter tests pass, and no digit reels exist.

- [ ] **Step 5: Commit metric motion**

```bash
git add src/data.ts src/components/Metrics.tsx src/components/Metrics.test.tsx src/styles/hero.css
git commit -m "feat: restore proof metric count-up"
```

### Task 4: Crossfade Process states and replace the score with diagnosis

**Files:**
- Modify: `src/components/Process.tsx`
- Modify: `src/components/Process.test.tsx`
- Modify: `src/styles/process.css`

**Interfaces:**
- Produces: `data-process-copy-layer`, `data-process-visual-layer`, `data-diagnosis-trace`, and `data-diagnosis-summary`.

- [ ] **Step 1: Write failing diagnostic and layer tests**

```ts
expect(container.querySelector('[data-diagnosis-trace]')).toBeInTheDocument()
expect(container).not.toHaveTextContent('TRUST SCORE')
expect(container).not.toHaveTextContent('/100')
expect(container).toHaveTextContent('Can we trust the lift?')
expect(container).toHaveTextContent('Identity join')

await user.click(screen.getByRole('button', { name: '02 Architect the system.' }))
expect(container.querySelectorAll('[data-process-visual-layer]')).toHaveLength(2)
expect(container.querySelector('[data-process-visual-layer="leaving"]')).toBeInTheDocument()
expect(container.querySelector('[data-process-visual-layer="entering"]')).toBeInTheDocument()
await waitFor(() => expect(container.querySelectorAll('[data-process-visual-layer]')).toHaveLength(1))
```

- [ ] **Step 2: Run Process tests and verify RED**

Run: `npm test -- --run src/components/Process.test.tsx`

Expected: the score remains and keyed replacement exposes only the new layer.

- [ ] **Step 3: Implement the reverse evidence trace**

Replace the score markup with a decision card, four evidence rows, connector SVG, two fault markers, and the three-column conclusion. Use the approved exact labels `CAN WE TRUST THE LIFT?`, `IDENTITY JOIN`, `CONSENT LOSS`, `SIGNALS CHECKED`, `BLOCKERS FOUND`, and `NEXT ACTION / FIX IDENTITY JOINS`.

- [ ] **Step 4: Implement stable two-layer crossfade state**

Track `{ current, previous }`, retain `previous` for `480ms`, and cancel stale cleanup timers when `activeStep` changes again. Render copy and visual stacks in the same CSS grid area. Incoming and outgoing layers use symmetric opacity keyframes; reduced motion finishes in `1ms`.

- [ ] **Step 5: Run Process tests and verify GREEN**

Run: `npm test -- --run src/components/Process.test.tsx`

Expected: diagnostic semantics and two-layer transition tests pass without act warnings.

- [ ] **Step 6: Commit Process refinements**

```bash
git add src/components/Process.tsx src/components/Process.test.tsx src/styles/process.css
git commit -m "feat: refine method state transitions"
```

### Task 5: Exact headline settling, permanent docs, and release verification

**Files:**
- Modify: `src/motion.ts`
- Modify: `src/motion.test.ts`
- Modify: `src/components/Process.tsx`
- Modify: `src/components/SystemsShowcase.tsx`
- Modify: `src/components/Contact.tsx`
- Modify: `src/styles/process.css`
- Modify: `src/styles/systems.css`
- Modify: `src/styles/contact-footer.css`
- Modify: `docs/design-language/scroll-choreography.md`

**Interfaces:**
- Produces: `HEADLINE_SCRUB` and `settleHeadlineReveal(targets, progress)` shared by all three masked headline scenes.

- [ ] **Step 1: Write failing shared-motion tests**

```ts
expect(HEADLINE_SCRUB).toBe(true)
const line = document.createElement('span')
line.style.transform = 'translateY(8px)'
expect(settleHeadlineReveal([line], 0.8)).toBe(false)
expect(settleHeadlineReveal([line], 1)).toBe(true)
expect(line.style.transform).toBe('')
```

- [ ] **Step 2: Run motion tests and verify RED**

Run: `npm test -- --run src/motion.test.ts`

Expected: the shared headline exports are missing.

- [ ] **Step 3: Implement exact settling in every headline timeline**

Export `HEADLINE_SCRUB = true`. `settleHeadlineReveal` clears the transform only when progress is at least `0.999`. Replace numeric `scrub: 0.7` in Process, Systems, and Contact with `HEADLINE_SCRUB`; call the helper from each ScrollTrigger `onUpdate`. Use `overflow: hidden` and paint containment for the line masks so Safari does not retain clipped antialias fragments.

- [ ] **Step 4: Update the permanent design-language document**

Replace the final-20% queue rule with gesture epochs, add `Viewport-framed compositions`, add `Known failure modes and safeguards`, record counter/crossfade/reduced-motion rules, and extend the release matrix with the supplied desktop sizes and continuous-stream tests.

- [ ] **Step 5: Run the complete automated verification**

Run:

```bash
npm test -- --run
npm run lint
npm run build
git diff --check
```

Expected: all tests pass, lint reports no errors, Vite builds successfully, and diff check is empty.

- [ ] **Step 6: Rebuild and verify localhost in real browsers**

Restart or refresh the `127.0.0.1:4173` preview from the new `dist`. Verify Chrome and Safari at `1440x900`, `1499x886`, `2554x1425`, `1455x1279`, `390x844`, `375x812`, and `320x568`. Exercise a long pixel stream, line-mode burst, quick fresh second gesture, touch, FAQ hover/open, all Process states, metric count-up, Proof/FAQ isolation, and headline settling with a stationary pointer.

- [ ] **Step 7: Commit the final documentation and settling change**

```bash
git add src/motion.ts src/motion.test.ts src/components/Process.tsx src/components/SystemsShowcase.tsx src/components/Contact.tsx src/styles/process.css src/styles/systems.css src/styles/contact-footer.css docs/design-language/scroll-choreography.md docs/superpowers/plans/2026-07-15-gesture-epochs-and-viewport-framing.md
git commit -m "fix: settle narrative compositions cleanly"
```
