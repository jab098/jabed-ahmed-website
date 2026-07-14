# Website V2 Good Fella Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Jabed Ahmed's analytics-consulting portfolio with the approved Good Fella-inspired composition and motion choreography, then serve the verified production build on localhost.

**Architecture:** Keep React 19, Vite, and TypeScript. Add GSAP/ScrollTrigger for coordinated timelines and Canvas 2D glyph fields for the hero and footer. Decompose the current monolithic interface into focused chapters with co-located behavior and split CSS by responsibility.

**Tech Stack:** React 19, TypeScript 6, Vite 8, GSAP 3 with ScrollTrigger, Canvas 2D, Vitest, Testing Library, jsdom, oxlint.

## Global Constraints

- Signal orange is `#FF5A1F`, near-black is `#11100F`, and warm white is `#F1F0EC`.
- Keep React 19, Vite, TypeScript, and Cloudflare Pages compatibility; do not migrate to Next.js.
- Use native scrolling; do not add Lenis or another smooth-scroll replacement.
- Corners remain square; do not introduce pills, rounded panels, circular buttons, glass cards, or stock photography.
- Reconstruct the supplied reference's visible timing, easing, masks, active states, pinning, pointer behavior, click behavior, section wipes, and responsive transformations as closely as practical.
- Do not invent client names, testimonials, outcomes, or case studies.
- Do not add a backend, CMS, newsletter service, or submission endpoint.
- Do not copy Good Fella source code or photography.
- Respect `prefers-reduced-motion`, keyboard interaction, focus visibility, and Canvas fallback requirements.
- Do not commit changes.
- Leave the completed production build running on localhost for review.

## File Structure

- `src/App.tsx`: page composition and section order only.
- `src/main.tsx`: application mount and GSAP registration.
- `src/data.ts`: navigation, proof, process, showcase, capability, and FAQ content.
- `src/motion.ts`: GSAP registration, shared eases, and reduced-motion query.
- `src/hooks.ts`: reusable visibility, media-query, and section-theme hooks.
- `src/components/PageLoader.tsx`: loader timeline and scroll unlock contract.
- `src/components/SiteNav.tsx`: fixed navigation, theme switching, and accessible menu.
- `src/components/GlyphCanvas.tsx`: reusable Canvas 2D glyph renderer and SVG fallback.
- `src/components/Hero.tsx`: masked hero copy and report interaction.
- `src/components/Metrics.tsx`: four-cell evidence strip and digit reels.
- `src/components/Process.tsx`: four-state desktop pin and mobile sequence.
- `src/components/SystemsShowcase.tsx`: black pinned systems reel and mobile stack.
- `src/components/Capabilities.tsx`: ruled six-cell capability chapter.
- `src/components/Faq.tsx`: semantic black FAQ chapter.
- `src/components/Contact.tsx`: warm-white project CTA.
- `src/components/SiteFooter.tsx`: interactive glyph finale and global colour control.
- `src/styles/base.css`: tokens, resets, typography, accessibility, shared grid, buttons, and masks.
- `src/styles/navigation.css`: fixed navigation and full-screen menu.
- `src/styles/opening.css`: loader, hero, glyph report, and metric strip.
- `src/styles/chapters.css`: process, systems, capabilities, and FAQ.
- `src/styles/finale.css`: contact and footer.
- `src/styles/responsive.css`: tablet, mobile, compact-height, reduced-motion, and print rules.
- `src/index.css`: ordered stylesheet imports only.
- `src/test/setup.ts`: Testing Library and browser API shims.
- `src/**/*.test.tsx`: component behavior tests.

---

### Task 1: Toolchain, bootstrap, tokens, and page composition

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `index.html`
- Modify: `vite.config.ts`
- Modify: `src/main.tsx`
- Modify: `src/App.tsx`
- Replace: `src/data.ts`
- Create: `src/motion.ts`
- Create: `src/test/setup.ts`
- Create: `src/styles/base.css`
- Replace: `src/index.css`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces `MOTION_EASE`, `REDUCED_MOTION_QUERY`, `registerMotion()` from `src/motion.ts`.
- Produces typed arrays `NAV_LINKS`, `METRICS`, `PROCESS_STEPS`, `SYSTEMS`, `CAPABILITIES`, `FAQS` from `src/data.ts`.
- Produces the final ordered landmarks consumed by all later tasks.

- [ ] **Step 1: Install runtime and test dependencies**

Run:

```bash
npm install gsap
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Expected: `package.json` contains `gsap` and the five test dependencies; `npm install` exits `0`.

- [ ] **Step 2: Add the failing composition test**

Create `src/App.test.tsx` with assertions for `main#main-content`, the loader, navigation, and the ordered section IDs `home`, `proof`, `process`, `systems`, `capabilities`, `faq`, `contact`.

```tsx
import { render, screen } from '@testing-library/react'
import App from './App'

it('renders the approved v2 chapter order', () => {
  const { container } = render(<App />)
  expect(screen.getByText('Skip to content')).toHaveAttribute('href', '#main-content')
  expect(container.querySelector('main#main-content')).toBeInTheDocument()
  expect([...container.querySelectorAll('main > section')].map((node) => node.id)).toEqual([
    'home',
    'proof',
    'process',
    'systems',
    'capabilities',
    'faq',
    'contact',
  ])
})
```

- [ ] **Step 3: Run the test and confirm the old composition fails**

Run: `npm test -- --run src/App.test.tsx`

Expected: FAIL because the V2 chapters and test script do not exist.

- [ ] **Step 4: Configure Vitest and the hard-refresh bootstrap**

Add `test: "vitest"` to `package.json`, configure jsdom and `src/test/setup.ts` in `vite.config.ts`, and place this behavior in the document head before application scripts:

```html
<script>
  history.scrollRestoration = 'manual'
  if (location.hash) history.replaceState(null, '', location.pathname + location.search)
  document.documentElement.classList.add('is-loading')
  scrollTo(0, 0)
  window.__loaderFallback = setTimeout(() => {
    document.documentElement.classList.remove('is-loading')
    document.documentElement.classList.add('loader-complete')
  }, 7000)
</script>
```

Add an inline critical style that paints `html`, `body`, and `#root` signal orange while `is-loading` is present.

- [ ] **Step 5: Create typed data, motion registration, base styles, and composition**

Implement:

```ts
export const MOTION_EASE = 'power3.out'
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
export function registerMotion(): void
```

Replace `App.tsx` with the approved chapter order and imports for the new components. Create each exported chapter with its final semantic `section` ID, approved heading, and typed data mapping so the composition test passes; later tasks add the chapter-specific animation and artwork without changing those public landmarks.

- [ ] **Step 6: Run foundation verification**

Run:

```bash
npm test -- --run src/App.test.tsx
npm run lint
npm run build
```

Expected: all commands exit `0` and the composition test passes.

---

### Task 2: Loader and accessible navigation

**Files:**
- Create: `src/components/PageLoader.tsx`
- Replace: `src/components/SiteNav.tsx`
- Create: `src/styles/navigation.css`
- Modify: `src/styles/opening.css`
- Test: `src/components/PageLoader.test.tsx`
- Test: `src/components/SiteNav.test.tsx`

**Interfaces:**
- `PageLoader({ onComplete }: { onComplete?: () => void })` removes loading state and unlocks scroll exactly once.
- `SiteNav()` consumes `NAV_LINKS` and emits `data-nav-theme="dark|light"`.

- [ ] **Step 1: Write failing loader and menu tests**

Tests assert that the loader contains `JA / DATA`, calls its completion callback, clears `window.__loaderFallback`, removes `is-loading`, restores overflow, opens the menu with `aria-expanded=true`, closes on Escape, and returns focus to the trigger.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npm test -- --run src/components/PageLoader.test.tsx src/components/SiteNav.test.tsx`

Expected: FAIL because the loader timeline and menu behavior are not implemented.

- [ ] **Step 3: Implement the GSAP loader timeline**

Build the ordered timeline with named labels:

```ts
timeline
  .addLabel('orange', 0)
  .fromTo(mark, { opacity: 0 }, { opacity: 1, duration: 0.35 })
  .addLabel('diagonal', 1.45)
  .to(orangePlane, { clipPath: 'polygon(100% 0,100% 0,100% 100%,0 100%)', duration: 0.72 })
  .addLabel('blackHold', 2.17)
  .addLabel('heroReveal', 2.48)
  .to(loaderRoot, { autoAlpha: 0, duration: 0.42 }, 3.08)
```

Use reduced-motion duration `0.55s` with the same final state.

- [ ] **Step 4: Implement the navigation and full-screen menu**

Use a semantic button, `aria-controls`, `aria-expanded`, Escape handling, body lock, a focus loop across menu controls, and focus restoration. Animate menu planes, numbered links, rules, and CTA with the shared orange/white masks.

- [ ] **Step 5: Verify loader and menu**

Run:

```bash
npm test -- --run src/components/PageLoader.test.tsx src/components/SiteNav.test.tsx
npm run lint
npm run build
```

Expected: tests, lint, and build pass.

---

### Task 3: Interactive glyph hero and metric reels

**Files:**
- Create: `src/components/GlyphCanvas.tsx`
- Replace: `src/components/Hero.tsx`
- Create: `src/components/Metrics.tsx`
- Create: `src/styles/opening.css`
- Test: `src/components/GlyphCanvas.test.tsx`
- Test: `src/components/Hero.test.tsx`
- Test: `src/components/Metrics.test.tsx`

**Interfaces:**
- `GlyphCanvas({ mode, palette, onPaletteChange, interactive, ariaLabel }: GlyphCanvasProps)` supports `mode: 'report' | 'stream'` and `palette: 0 | 1 | 2`.
- `Hero()` owns the report palette and exposes a keyboard-operable report button.
- `Metrics()` consumes `METRICS` and renders vertical `.digit-reel` tracks.

- [ ] **Step 1: Write failing interaction and metric tests**

Assert static SVG fallback in jsdom, accessible report label, palette cycling on click and Enter, exact headline text, exact metric values, and the presence of reel tracks rather than count-up text state.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npm test -- --run src/components/GlyphCanvas.test.tsx src/components/Hero.test.tsx src/components/Metrics.test.tsx`

Expected: FAIL because the Canvas renderer and reels are missing.

- [ ] **Step 3: Implement the reusable Canvas glyph engine**

Use a deterministic seeded point field with this public shape:

```ts
export type GlyphPalette = 0 | 1 | 2
export type GlyphMode = 'report' | 'stream'
export interface GlyphCanvasProps {
  mode: GlyphMode
  palette: GlyphPalette
  onPaletteChange?: (palette: GlyphPalette) => void
  interactive?: boolean
  ariaLabel: string
}
```

Cap device-pixel ratio at `1.75`, pause through IntersectionObserver and `document.hidden`, restore displaced points with spring interpolation, and return an SVG fallback when `getContext('2d')` is unavailable.

- [ ] **Step 4: Implement the hero and metrics**

Build the desktop split, mobile vertical composition, irregular stepped report silhouette, scan-bar text masks, split CTAs, proof metadata, and chart labels. Implement metric reels as duplicated `0–9` tracks animated with GSAP when the strip intersects.

- [ ] **Step 5: Verify opening chapters**

Run:

```bash
npm test -- --run src/components/GlyphCanvas.test.tsx src/components/Hero.test.tsx src/components/Metrics.test.tsx
npm run lint
npm run build
```

Expected: all pass.

---

### Task 4: Four-state How I Work chapter

**Files:**
- Create: `src/components/Process.tsx`
- Create: `src/styles/chapters.css`
- Test: `src/components/Process.test.tsx`

**Interfaces:**
- `Process()` consumes `PROCESS_STEPS` and emits `data-active-step="0|1|2|3"`.
- Each step visual is a semantic decorative figure with one concise accessible caption.

- [ ] **Step 1: Write the failing process test**

Assert four numbered steps, exact titles, four visual figures, initial active step `0`, and sequential mobile markup where every step is adjacent to its figure.

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `npm test -- --run src/components/Process.test.tsx`

Expected: FAIL because the process chapter does not exist.

- [ ] **Step 3: Implement desktop pinning and mobile sequencing**

Create one GSAP ScrollTrigger spanning four viewport states. Derive the active step from normalized progress, move the orange marker, roll the index, clip outgoing/incoming text, and crossfade/translate the right-side artefacts. Use a media-query branch so widths below `768px` render natural sequential blocks with entrance triggers and no pinning.

- [ ] **Step 4: Verify process behavior**

Run:

```bash
npm test -- --run src/components/Process.test.tsx
npm run lint
npm run build
```

Expected: all pass.

---

### Task 5: Systems showcase and chapter transitions

**Files:**
- Create: `src/components/SystemsShowcase.tsx`
- Modify: `src/styles/chapters.css`
- Test: `src/components/SystemsShowcase.test.tsx`

**Interfaces:**
- `SystemsShowcase()` consumes `SYSTEMS`, emits `data-active-system="0|1|2|3"`, and exposes four thumbnail buttons.
- `scrollToSystem(index: number): void` maps a thumbnail to the corresponding pinned progress segment.

- [ ] **Step 1: Write the failing showcase test**

Assert four truthful system examples, four thumbnail buttons, exact technical labels, initial active system `0`, and mobile artefact/title adjacency.

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `npm test -- --run src/components/SystemsShowcase.test.tsx`

Expected: FAIL because the systems reel is missing.

- [ ] **Step 3: Implement the black pinned reel**

Use a desktop ScrollTrigger with a fixed left rail, stacked right artefacts, orange active marker, thumbnail-to-progress mapping, black/orange entry scan, and warm-white exit bridge. On mobile, render full-width sequential artefacts without pinning.

- [ ] **Step 4: Verify the systems chapter**

Run:

```bash
npm test -- --run src/components/SystemsShowcase.test.tsx
npm run lint
npm run build
```

Expected: all pass.

---

### Task 6: Capabilities and semantic FAQ

**Files:**
- Create: `src/components/Capabilities.tsx`
- Create: `src/components/Faq.tsx`
- Modify: `src/styles/chapters.css`
- Test: `src/components/Capabilities.test.tsx`
- Test: `src/components/Faq.test.tsx`

**Interfaces:**
- `Capabilities()` consumes the six `CAPABILITIES` records.
- `Faq()` consumes the six `FAQS` records and keeps `openId: string | null`.

- [ ] **Step 1: Write failing capability and FAQ tests**

Assert six capability cells with exact titles, no nested card role, six FAQ buttons, `aria-expanded` updates, one open answer at a time, Escape closure, and hidden closed answers.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npm test -- --run src/components/Capabilities.test.tsx src/components/Faq.test.tsx`

Expected: FAIL because the ruled grid and FAQ do not exist.

- [ ] **Step 3: Implement the ruled grid and black FAQ**

Construct capability rules on intersection, add contained orange hover/focus rails, and build FAQ rows with semantic buttons, clipped answer grids, rotating indicators, and orange rule sweeps. Use `hidden`/`inert` semantics for closed content.

- [ ] **Step 4: Verify capabilities and FAQ**

Run:

```bash
npm test -- --run src/components/Capabilities.test.tsx src/components/Faq.test.tsx
npm run lint
npm run build
```

Expected: all pass.

---

### Task 7: Start a Project and interactive footer

**Files:**
- Replace: `src/components/Contact.tsx`
- Create: `src/components/SiteFooter.tsx`
- Create: `src/styles/finale.css`
- Test: `src/components/Contact.test.tsx`
- Test: `src/components/SiteFooter.test.tsx`

**Interfaces:**
- `Contact()` uses `CALENDLY_URL` and `EMAIL`.
- `SiteFooter()` owns `palette: GlyphPalette` and shares the `GlyphCanvas` stream mode.

- [ ] **Step 1: Write failing finale tests**

Assert `Start a project.`, exact call and email destinations, `Audit / Build / Enable`, footer navigation, `C / change signal`, palette cycling on click and `C`, and no newsletter form.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npm test -- --run src/components/Contact.test.tsx src/components/SiteFooter.test.tsx`

Expected: FAIL because the V2 finale is absent.

- [ ] **Step 3: Implement the contact wipe and footer scene**

Build the asymmetric contact composition and project-brief artefact. Create a full-viewport footer with stream-mode glyphs, sparse contact/navigation grid, keyboard colour control, availability, copyright, and oversized dim wordmark.

- [ ] **Step 4: Verify finale behavior**

Run:

```bash
npm test -- --run src/components/Contact.test.tsx src/components/SiteFooter.test.tsx
npm run lint
npm run build
```

Expected: all pass.

---

### Task 8: Responsive parity, accessibility, visual tuning, and localhost preview

**Files:**
- Create: `src/styles/responsive.css`
- Modify: `src/styles/base.css`
- Modify: `src/styles/navigation.css`
- Modify: `src/styles/opening.css`
- Modify: `src/styles/chapters.css`
- Modify: `src/styles/finale.css`
- Modify: component files only where browser evidence identifies a specific defect.

**Interfaces:**
- No new public component interfaces.
- Final output is the production build served at `http://localhost:4173/`.

- [ ] **Step 1: Run the complete automated suite**

Run:

```bash
npm test -- --run
npm run lint
npm run build
```

Expected: all tests pass; lint and build exit `0`.

- [ ] **Step 2: Verify browser behavior at target viewports**

Inspect `1440x900`, `1280x633`, `768x1024`, `390x844`, `375x812`, and `320x568`. At each size verify no horizontal overflow, usable navigation, visible hero actions, correct desktop pin/mobile sequence behavior, capability/FAQ stacking, and readable footer content.

- [ ] **Step 3: Compare animation checkpoints to the reference**

Capture the loader orange field, diagonal cut, black hold, hero scan reveal, report hover/click states, metric reels, all four process states, all four systems states, black-to-white wipe, FAQ expansion, contact entrance, and footer glyph interaction. Adjust GSAP timing/easing and CSS geometry until the visible order and composition align with the supplied recording as closely as practical.

- [ ] **Step 4: Verify accessibility and failure states**

Check keyboard-only menu/report/FAQ/footer operation, focus visibility, Escape behavior, reduced motion, Canvas-disabled SVG fallback, refresh from `#contact`, refresh after scrolling, and document-hidden animation pausing.

- [ ] **Step 5: Start the production preview and leave it running**

Run:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

Expected: the process remains running and `http://localhost:4173/` serves the production build with no console errors or Vite overlay.
