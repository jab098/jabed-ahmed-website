# Proof Content Band Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the desktop Proof frame's bottom-heavy composition with a shared horizontal content band without changing its scroll stop or exposing Process.

**Architecture:** Add one semantic content wrapper to the Proof art tile and each metric tile. Desktop CSS centres all four wrappers on a `60%` band; mobile leaves the wrappers in the existing bottom-aligned flex flow.

**Tech Stack:** React 19, TypeScript 6, authored CSS, Vitest, Testing Library

## Global Constraints

- Keep `#proof[data-scroll-frame="viewport"][data-scroll-waypoint="proof"]` unchanged.
- Keep all three `data-scroll-waypoint-mobile="proof-metric-0N"` declarations unchanged.
- Do not change metric values, count-up timing, tile colours, borders or artwork.
- Apply the shared band only above `900px`.

---

### Task 1: Add and position the shared Proof content band

**Files:**
- Modify: `src/components/Metrics.test.tsx`
- Modify: `src/styles/viewportFrames.test.ts`
- Modify: `src/components/Metrics.tsx`
- Modify: `src/styles/hero.css`
- Modify: `docs/design-language/scroll-choreography.md`

**Interfaces:**
- Consumes: the existing `Metrics` component, `data-scroll-frame="viewport"`, `data-scroll-waypoint="proof"`, and desktop `@media (min-width: 901px)` rule.
- Produces: four `[data-proof-content-band]` wrappers and the CSS custom property `--proof-content-band: 60%`.

- [x] **Step 1: Write the failing structural and CSS tests**

Add to the rendered Proof assertion in `src/components/Metrics.test.tsx`:

```ts
expect(container.querySelectorAll('[data-proof-content-band]')).toHaveLength(4)
```

Read `src/styles/hero.css` in `src/styles/viewportFrames.test.ts` and assert:

```ts
expect(heroStyles).toContain('--proof-content-band: 60%')
expect(heroStyles).toMatch(
  /\.proof-art__content,[\s\S]*?\.proof-metric__content\s*\{[^}]*top: var\(--proof-content-band\);[^}]*transform: translateY\(-50%\);/,
)
```

- [x] **Step 2: Run the focused tests and verify RED**

Run:

```bash
npm test -- --run src/components/Metrics.test.tsx src/styles/viewportFrames.test.ts
```

Expected: both new assertions fail because the wrappers and desktop band do not exist.

- [x] **Step 3: Add the four semantic wrappers**

Wrap the Proof heading block:

```tsx
<div className="proof-art__content" data-proof-content-band>
  <p className="eyebrow">// Evidence</p>
  <h2 id="proof-title">Proof in the system.</h2>
</div>
```

Wrap each metric's value and label:

```tsx
<div className="proof-metric__content" data-proof-content-band>
  <CountUpValue {...props} />
  <p>{metric.label}</p>
</div>
```

- [x] **Step 4: Position the shared desktop band**

Add stable wrapper layering outside media queries:

```css
.proof-art__content,
.proof-metric__content {
  position: relative;
  z-index: 1;
}
```

Extend the desktop rule:

```css
@media (min-width: 901px) {
  .proof-section {
    --proof-content-band: 60%;
    grid-template-rows: 1fr;
  }

  .proof-art__content,
  .proof-metric__content {
    position: absolute;
    top: var(--proof-content-band);
    right: 1.3rem;
    left: 1.3rem;
    transform: translateY(-50%);
  }

  .proof-art__content {
    right: 1.4rem;
    left: 1.4rem;
  }
}
```

Add a compact-desktop metric clamp between `901px` and `1200px` so the widest
decimal count-up state stays within its tile:

```css
@media (min-width: 901px) and (max-width: 1200px) {
  .static-value { font-size: clamp(3.1rem, 5.8vw, 6rem); }
}
```

- [x] **Step 5: Update the design language and verify GREEN**

Document that desktop Proof centres its four content blocks on the shared `60%` band while the viewport frame, next-section isolation and mobile stops remain unchanged.

Run:

```bash
npm test -- --run src/components/Metrics.test.tsx src/styles/viewportFrames.test.ts
npm test -- --run
npm run lint
npm run build
git diff --check
```

Expected: all commands exit `0` with no failed tests, lint findings, build errors or whitespace errors.

- [x] **Step 6: Commit and start the test server**

```bash
git add docs/superpowers/specs/2026-07-15-proof-content-band-refinement-design.md docs/superpowers/plans/2026-07-15-proof-content-band-refinement.md docs/design-language/scroll-choreography.md src/components/Metrics.test.tsx src/styles/viewportFrames.test.ts src/components/Metrics.tsx src/styles/hero.css
git commit -m "refine proof content alignment"
npm run dev -- --host 127.0.0.1
```

Expected: Vite reports a working localhost URL and remains running for user testing.
