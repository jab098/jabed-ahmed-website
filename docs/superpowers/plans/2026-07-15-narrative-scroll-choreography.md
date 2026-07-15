# Narrative Scroll Choreography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive wheel, trackpad, and touch scroll director that advances through every authored headline and story state without allowing one gesture to skip an adjacent destination.

**Architecture:** Keep the real document scroll and existing GSAP/ScrollTrigger scenes. A pure `NarrativeGestureDirector` owns one-gesture/one-target state, while a small React adapter collects physical and pinned waypoints, wires browser events, and animates `window.scrollY`; components declare their narrative destinations with stable data attributes.

**Tech Stack:** React 19, TypeScript 6, GSAP 3 with ScrollTrigger, Vitest 4, Testing Library, Vite 8, CSS.

## Global Constraints

- One wheel burst, trackpad gesture, or touch swipe may advance only to the immediately adjacent waypoint.
- Trackpad momentum and input during a handoff must never queue another destination.
- Headline, pinned Process, Systems, responsive card, Contact, and Footer destinations must remain addressable.
- Adjacent measured waypoint gaps must be no larger than `82vh` after continuation insertion.
- Wheel intent uses `clamp(72px, 12vh, 120px)`; touch intent uses `clamp(56px, 10vh, 96px)`.
- Handoffs use `power3.inOut` and `clamp(520ms, 520ms + remainingDistance * 0.32ms/px, 980ms)`.
- `prefers-reduced-motion: reduce`, keyboard scrolling, scrollbar dragging, focus scrolling, pinch zoom, multi-touch, horizontal gestures, and eligible nested scrollers remain native.
- Add no runtime dependency and do not replace document scroll with a transform-based virtual scroller.
- Preserve the existing loader, theme, copy, pinned desktop scenes, and unrelated `.claude-flow` changes.

---

### Task 1: Pure waypoint and gesture engine

**Files:**
- Create: `src/narrativeScroll.ts`
- Create: `src/narrativeScroll.test.ts`

**Interfaces:**
- Produces: `ScrollWaypoint`, `Direction`, `buildWaypointMap`, `normalizeWheelDelta`, `findDirectionalWaypoint`, `wheelIntentThreshold`, `touchIntentThreshold`, `handoffDuration`, `NarrativeGestureDirector`.
- `NarrativeGestureDirector` consumes injected geometry, scrolling, animation, timer, and eligibility functions so tests exercise real state transitions without mocking GSAP.

- [ ] **Step 1: Write failing waypoint and normalization tests**

```ts
import { describe, expect, it } from 'vitest'
import {
  buildWaypointMap,
  findDirectionalWaypoint,
  handoffDuration,
  normalizeWheelDelta,
  touchIntentThreshold,
  wheelIntentThreshold,
} from './narrativeScroll'

describe('narrative waypoint model', () => {
  it('sorts and deduplicates authored positions before adding 82vh continuations', () => {
    const points = buildWaypointMap([
      { id: 'contact', y: 1800, priority: 2 },
      { id: 'home-copy', y: 2, priority: 2 },
      { id: 'home', y: 0, priority: 3 },
    ], 1000, 2000)
    expect(points[0]).toMatchObject({ id: 'home', y: 0 })
    expect(Math.max(...points.slice(1).map((point, index) => point.y - points[index].y))).toBeLessThanOrEqual(820)
  })

  it('normalizes pixel, line, and page wheel deltas', () => {
    expect(normalizeWheelDelta(12, 0, 800)).toBe(12)
    expect(normalizeWheelDelta(3, 1, 800)).toBe(48)
    expect(normalizeWheelDelta(1, 2, 800)).toBe(800)
  })

  it('resolves only the first destination in the requested direction', () => {
    const points = [{ id: 'a', y: 0 }, { id: 'b', y: 500 }, { id: 'c', y: 1000 }]
    expect(findDirectionalWaypoint(points, 20, 1)?.id).toBe('b')
    expect(findDirectionalWaypoint(points, 980, -1)?.id).toBe('b')
  })

  it('uses the approved adaptive thresholds and duration cap', () => {
    expect(wheelIntentThreshold(800)).toBe(96)
    expect(touchIntentThreshold(800)).toBe(80)
    expect(handoffDuration(2000)).toBe(980)
  })
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- --run src/narrativeScroll.test.ts`

Expected: FAIL because `src/narrativeScroll.ts` does not exist.

- [ ] **Step 3: Implement the pure waypoint helpers**

```ts
export type Direction = -1 | 1
export type ScrollWaypoint = { id: string; y: number; priority?: number }

const clamp = (min: number, value: number, max: number) => Math.min(max, Math.max(min, value))

export function normalizeWheelDelta(delta: number, mode: number, viewportHeight: number) {
  if (mode === 1) return delta * 16
  if (mode === 2) return delta * viewportHeight
  return delta
}

export const wheelIntentThreshold = (height: number) => clamp(72, height * 0.12, 120)
export const touchIntentThreshold = (height: number) => clamp(56, height * 0.1, 96)
export const handoffDuration = (distance: number) => clamp(520, 520 + distance * 0.32, 980)

export function buildWaypointMap(points: ScrollWaypoint[], viewportHeight: number, maxY: number) {
  const sorted = points
    .filter((point) => Number.isFinite(point.y))
    .map((point) => ({ ...point, y: clamp(0, point.y, maxY) }))
    .sort((a, b) => a.y - b.y || (b.priority ?? 0) - (a.priority ?? 0))
  const authored = sorted.filter((point, index) => index === 0 || Math.abs(point.y - sorted[index - 1].y) > 4)
  const maximumGap = viewportHeight * 0.82
  return authored.flatMap((point, index) => {
    const next = authored[index + 1]
    if (!next || next.y - point.y <= maximumGap) return [point]
    const segments = Math.ceil((next.y - point.y) / maximumGap)
    return [point, ...Array.from({ length: segments - 1 }, (_, offset) => ({
      id: `${point.id}--continuation-${offset + 1}`,
      y: point.y + ((next.y - point.y) * (offset + 1)) / segments,
      priority: 0,
    }))]
  })
}
```

- [ ] **Step 4: Write failing one-gesture and touch state tests**

```ts
const wheelInput = (deltaY: number) => ({
  ctrlKey: false,
  deltaMode: 0,
  deltaX: 0,
  deltaY,
  preventDefault: vi.fn(),
})

const touchInput = (clientX: number, clientY: number) => ({
  preventDefault: vi.fn(),
  touches: [{ clientX, clientY }],
})

function createDirectorHarness(positions: number[]) {
  let scrollY = positions[0]
  let quietTimer = () => {}
  const animations: number[] = []
  const scrollWrites: number[] = []
  const director = new NarrativeGestureDirector({
    getScrollY: () => scrollY,
    getViewportHeight: () => 800,
    getWaypoints: () => positions.map((y, index) => ({ id: `point-${index}`, y })),
    canClaim: () => true,
    writeScroll: (y) => { scrollY = y; scrollWrites.push(y) },
    animate: ({ to, onComplete }) => { scrollY = to; animations.push(to); onComplete() },
    setTimer: (callback) => { quietTimer = callback; return 1 },
    clearTimer: () => {},
  })
  return { animations, director, runQuietTimer: () => quietTimer(), scrollWrites }
}

it('clamps an extreme wheel event to one adjacent target', () => {
  const harness = createDirectorHarness([0, 600, 1200])
  harness.director.handleWheel(wheelInput(10000))
  expect(harness.animations).toEqual([600])
  expect(harness.scrollWrites.every((value) => value <= 600)).toBe(true)
})

it('absorbs momentum until the quiet timer rearms the director', () => {
  const harness = createDirectorHarness([0, 600, 1200])
  harness.director.handleWheel(wheelInput(10000))
  harness.director.handleWheel(wheelInput(10000))
  expect(harness.animations).toEqual([600])
  harness.runQuietTimer()
  harness.director.handleWheel(wheelInput(10000))
  expect(harness.animations).toEqual([600, 1200])
})

it('clamps a long touch swipe to one adjacent target', () => {
  const harness = createDirectorHarness([0, 600, 1200])
  harness.director.handleTouchStart(touchInput(100, 700))
  harness.director.handleTouchMove(touchInput(100, -700))
  harness.director.handleTouchEnd()
  expect(harness.animations).toEqual([600])
})
```

- [ ] **Step 5: Run the focused test and verify RED**

Run: `npm test -- --run src/narrativeScroll.test.ts`

Expected: FAIL because `NarrativeGestureDirector` and the test harness contract do not exist.

- [ ] **Step 6: Implement `NarrativeGestureDirector`**

Implement the exact public methods below. `handleWheel` resolves one adjacent target, caps preview movement at the adaptive threshold, commits once, and remains locked until the injected 180ms quiet timer runs. `handleTouchMove` claims only a vertically dominant single touch after eight pixels, clamps direct travel to one target, and `handleTouchEnd` settles forward or back.

```ts
export type AnimationRequest = { to: number; duration: number; onComplete: () => void }
export type DirectorDependencies = {
  getScrollY: () => number
  getViewportHeight: () => number
  getWaypoints: () => ScrollWaypoint[]
  canClaim: (direction: Direction) => boolean
  writeScroll: (y: number) => void
  animate: (request: AnimationRequest) => (() => void) | void
  setTimer: (callback: () => void, delay: number) => unknown
  clearTimer: (timer: unknown) => void
}

export class NarrativeGestureDirector {
  constructor(dependencies: DirectorDependencies)
  handleWheel(input: WheelInput): boolean
  handleTouchStart(input: TouchInput): void
  handleTouchMove(input: TouchInput): boolean
  handleTouchEnd(): boolean
  handleTouchCancel(): void
  goTo(y: number): void
  destroy(): void
}
```

- [ ] **Step 7: Run focused tests and verify GREEN**

Run: `npm test -- --run src/narrativeScroll.test.ts`

Expected: all waypoint and gesture-engine tests pass with no warnings.

- [ ] **Step 8: Commit the engine**

```bash
git add src/narrativeScroll.ts src/narrativeScroll.test.ts
git commit -m "feat: add narrative scroll gesture engine"
```

---

### Task 2: Browser adapter and GSAP handoff

**Files:**
- Create: `src/components/NarrativeScroll.tsx`
- Create: `src/components/NarrativeScroll.test.tsx`
- Modify: `src/App.tsx:1-30`
- Modify: `src/App.test.tsx:1-19`
- Modify: `src/styles/base.css:17-20`

**Interfaces:**
- Consumes: `NarrativeGestureDirector`, `buildWaypointMap`, and `ScrollTrigger.getById`.
- Produces: `NarrativeScroll`, `collectNarrativeWaypoints`, and active `wheel`, `touchstart`, `touchmove`, `touchend`, and `touchcancel` listeners.

- [ ] **Step 1: Write failing adapter and App tests**

```tsx
it('mounts the narrative scroll director beside the document content', () => {
  const { container } = render(<App />)
  expect(container.querySelector('[data-narrative-scroll-director]')).toBeInTheDocument()
})

it('collects physical, responsive, virtual, and track waypoints in document order', () => {
  const mockElementPosition = (element: Element, top: number) => {
    Object.defineProperty(element, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ bottom: top, height: 0, left: 0, right: 0, top, width: 0, x: 0, y: top }),
    })
  }
  document.body.innerHTML = `
    <header class="site-nav"></header>
    <main><section data-scroll-waypoint="home"></section></main>
  `
  mockElementPosition(document.querySelector('[data-scroll-waypoint]')!, 0)
  expect(collectNarrativeWaypoints().map((point) => point.id)).toContain('home')
})
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npm test -- --run src/components/NarrativeScroll.test.tsx src/App.test.tsx`

Expected: FAIL because `NarrativeScroll` and its DOM marker are absent.

- [ ] **Step 3: Implement the adapter**

Create a visually hidden marker with `data-narrative-scroll-director`. In a layout effect:

```tsx
const points = collectNarrativeWaypoints()
const director = new NarrativeGestureDirector({
  getScrollY: () => window.scrollY,
  getViewportHeight: () => window.innerHeight,
  getWaypoints: () => points,
  canClaim: (direction) =>
    document.documentElement.classList.contains('loader-complete') &&
    document.body.style.overflow !== 'hidden' &&
    !shouldYieldToNativeScroll(activeTarget, direction),
  writeScroll: (y) => window.scrollTo(0, y),
  animate: ({ to, duration, onComplete }) => {
    const proxy = { y: window.scrollY }
    const tween = gsap.to(proxy, {
      y: to,
      duration: duration / 1000,
      ease: 'power3.inOut',
      overwrite: true,
      onUpdate: () => window.scrollTo(0, proxy.y),
      onComplete,
    })
    return () => tween.kill()
  },
  setTimer: (callback, delay) => window.setTimeout(callback, delay),
  clearTimer: (timer) => window.clearTimeout(timer as number),
})
```

Rebuild geometry after loader completion, `document.fonts.ready`, resize, orientation change, ScrollTrigger refresh, one root `ResizeObserver`, and FAQ `transitionend`. Add `html.narrative-scroll-active { scroll-behavior: auto; }` and remove the class during cleanup. Reduced-motion mode returns without registering interception.

- [ ] **Step 4: Mount the adapter in `App`**

```tsx
<main id="main-content">
  <Hero />
  <Metrics />
  <Process />
  <SystemsShowcase />
  <Capabilities />
  <Faq />
  <Contact />
</main>
<NarrativeScroll />
```

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `npm test -- --run src/components/NarrativeScroll.test.tsx src/App.test.tsx`

Expected: both files pass and listener cleanup produces no act warnings.

- [ ] **Step 6: Commit the browser adapter**

```bash
git add src/components/NarrativeScroll.tsx src/components/NarrativeScroll.test.tsx src/App.tsx src/App.test.tsx src/styles/base.css
git commit -m "feat: connect narrative scroll to the page"
```

---

### Task 3: Declare every responsive narrative destination

**Files:**
- Modify: `src/components/Hero.tsx:108-145`
- Modify: `src/components/Metrics.tsx:28-45`
- Modify: `src/components/Process.tsx:103-187`
- Modify: `src/components/Process.test.tsx:1-51`
- Modify: `src/components/SystemsShowcase.tsx:81-180`
- Modify: `src/components/SystemsShowcase.test.tsx:1-17`
- Modify: `src/components/Capabilities.tsx:19-64`
- Modify: `src/components/Capabilities.test.tsx`
- Modify: `src/components/Faq.tsx:4-47`
- Modify: `src/components/Faq.test.tsx`
- Modify: `src/components/Contact.tsx:36-78`
- Modify: `src/styles/process.css:1-251`

**Interfaces:**
- Consumes: collector attributes `data-scroll-waypoint`, `data-scroll-waypoint-mobile`, `data-scroll-waypoint-desktop`, `data-scroll-virtual`, `data-scroll-trigger`, `data-scroll-progress`, and `data-scroll-track-waypoint`.
- Produces: the complete desktop and mobile waypoint inventory from the approved specification.

- [ ] **Step 1: Write failing structural and mobile Process tests**

```tsx
it('declares the headline and four virtual desktop process destinations', () => {
  const { container } = render(<Process />)
  expect(container.querySelector('[data-scroll-waypoint="process-heading"]')).toBeInTheDocument()
  expect(container.querySelectorAll('[data-scroll-trigger="process-pin"]')).toHaveLength(4)
})

it('renders all four process scenes sequentially on mobile', () => {
  mockMobileMediaQuery(true)
  const { container } = render(<Process />)
  expect(container.querySelectorAll('[data-scroll-waypoint-mobile^="process-"]')).toHaveLength(4)
  expect(screen.queryByRole('group', { name: 'Process stages' })).not.toBeInTheDocument()
})

it('declares four system destinations and the bridge', () => {
  const { container } = render(<SystemsShowcase />)
  expect(container.querySelectorAll('[data-scroll-track-waypoint]')).toHaveLength(5)
})
```

- [ ] **Step 2: Run component tests and verify RED**

Run: `npm test -- --run src/components/Process.test.tsx src/components/SystemsShowcase.test.tsx src/components/Capabilities.test.tsx src/components/Faq.test.tsx`

Expected: FAIL because the destination attributes and sequential mobile Process markup do not exist.

- [ ] **Step 3: Add common and responsive waypoint attributes**

Use these stable IDs:

```text
home, hero-report, proof, proof-metric-01..03,
process-heading, process-01..04,
systems-heading, system-01..04, systems-bridge,
capabilities-heading, capability-01..06,
faq-heading, faq-01..N, contact, footer
```

Assign `id: 'process-pin'` and `id: 'systems-pin'` to the existing desktop ScrollTriggers. Process buttons declare progress values `0.08`, `0.34`, `0.60`, and `0.86`. Systems track items use `data-scroll-track-waypoint` so the collector derives progress from `offsetLeft` and the actual track width.

- [ ] **Step 4: Render sequential mobile Process scenes**

Use a `matchMedia('(max-width: 900px)')` state that updates on media-query changes. Desktop retains the current tabs and active visual. Mobile maps all `PROCESS_STEPS` into physical scenes containing the number/title/copy followed by `ProcessVisual`, each marked with its own mobile waypoint.

- [ ] **Step 5: Add mobile Process layout styles**

```css
.process-mobile { display: none; }

@media (max-width: 900px) {
  .process-stage--desktop { display: none; }
  .process-mobile { display: block; }
  .process-mobile__scene { padding: 4rem 1.2rem 1.2rem; border-bottom: 1px solid var(--ink); }
  .process-mobile__copy { padding-bottom: 2rem; }
  .process-mobile__copy span { font: 600 0.6rem 'JetBrains Mono', monospace; }
  .process-mobile__copy h3 { margin: 0.75rem 0; font-size: clamp(2.4rem, 11vw, 4.5rem); line-height: 0.9; }
  .process-mobile__copy p { max-width: 36rem; line-height: 1.5; }
  .process-mobile .process-visual { min-height: max(32rem, 70svh); }
}
```

- [ ] **Step 6: Run component tests and verify GREEN**

Run: `npm test -- --run src/components/Process.test.tsx src/components/SystemsShowcase.test.tsx src/components/Capabilities.test.tsx src/components/Faq.test.tsx src/components/Hero.test.tsx src/components/Metrics.test.tsx src/components/Contact.test.tsx`

Expected: all scene tests pass with the full responsive inventory.

- [ ] **Step 7: Commit the scene contract**

```bash
git add src/components src/styles/process.css
git commit -m "feat: declare narrative scroll waypoints"
```

---

### Task 4: Permanent design-language documentation

**Files:**
- Create: `docs/design-language/scroll-choreography.md`
- Modify: `README.md:1-3`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Produces: the contributor-facing waypoint checklist and a README entry point.

- [ ] **Step 1: Write the failing documentation contract test**

```ts
import { readFileSync } from 'node:fs'

it('links the permanent scroll choreography contract', () => {
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8')
  expect(readme).toContain('docs/design-language/scroll-choreography.md')
})
```

- [ ] **Step 2: Run the App test and verify RED**

Run: `npm test -- --run src/App.test.tsx`

Expected: FAIL because README does not link the design-language document.

- [ ] **Step 3: Write the durable design-language document and README link**

Create `docs/design-language/scroll-choreography.md` with these exact sections: `Invariant`, `Declaring waypoints`, `Pinned scenes`, `Responsive scenes`, `Input behavior`, `Accessibility exceptions`, `Dynamic layout`, `Tests`, and `Release checklist`. Each section copies the corresponding approved rules and attribute names from the design specification. Add this exact README entry:

```md
## Design language

- [Scroll choreography](docs/design-language/scroll-choreography.md) — waypoint declarations, one-gesture navigation, responsive behavior, and release checks.
```

- [ ] **Step 4: Run the App test and verify GREEN**

Run: `npm test -- --run src/App.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit documentation**

```bash
git add README.md docs/design-language/scroll-choreography.md src/App.test.tsx
git commit -m "docs: document scroll choreography language"
```

---

### Task 5: Full verification and localhost handoff

**Files:**
- Modify only if a failing verification receives a reproducing test first.

**Interfaces:**
- Consumes: completed narrative-scroll implementation.
- Produces: a verified production preview at `http://localhost:4173/`.

- [ ] **Step 1: Run static and automated verification**

Run:

```bash
npm test -- --run
npm run lint
npm run build
git diff --check
```

Expected: all tests pass, lint exits zero, production build exits zero, and diff check emits no output.

- [ ] **Step 2: Review React changes**

Run the `vercel:react-best-practices` review against all edited TSX files. Apply only evidence-backed changes, adding a failing test before behavior changes.

- [ ] **Step 3: Start the production preview on port 4173**

Stop the old preview process only after the new build passes, then run:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

- [ ] **Step 4: Verify desktop no-skipping behavior in a real browser**

At desktop width, dispatch one `wheel` event with `deltaY: 10000`, wait for the handoff, and assert that the page reaches only the adjacent waypoint. Verify a momentum burst cannot reach another waypoint until a fresh gesture after quiet. Repeat upward through Process and Systems headline/state boundaries.

- [ ] **Step 5: Verify mobile touch behavior in a real browser**

At `390x844`, `375x812`, and `320x568`, emulate a long vertical touch drag and verify one adjacent destination, sequential Process states, stacked Systems cards, capability cards, FAQ rows, Contact, and Footer. Verify taps, horizontal movement, multi-touch/pinch behavior where supported, menu scrolling, and FAQ expansion are not trapped.

- [ ] **Step 6: Verify presentation and runtime health**

Confirm HTTP 200, meaningful body content, no Vite overlay, no console errors, no horizontal overflow, loader completion, responsive rebuilds, reduced-motion native scrolling, anchors, keyboard navigation, and Back to top.

- [ ] **Step 7: Run the final verification gate**

Freshly re-run:

```bash
npm test -- --run && npm run lint && npm run build && git diff --check
curl --fail --silent --show-error --head http://127.0.0.1:4173/
```

Expected: all commands exit zero and localhost returns `HTTP/1.1 200 OK`.
