# Home Hero Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic dark dashboard hero with a light editorial hero and animated signal network that communicates Jabed's end-to-end analytics expertise.

**Architecture:** Keep the redesign inside the existing React component and global CSS architecture. `Hero.tsx` renders one semantic content column plus a decorative `SignalSystem`; `SiteNav.tsx` switches its first-screen theme to dark-on-light; `index.css` supplies compositor-friendly motion and responsive states.

**Tech Stack:** React 19, TypeScript 6, Tailwind CSS 4 utilities, authored CSS keyframes, inline SVG, Lucide React.

## Global Constraints

- Preserve the existing Inter, Playfair Display, and JetBrains Mono type families.
- Preserve `#00df8e` as the primary brand accent and `#0A0D10` as the dark neutral.
- Do not add runtime dependencies or image assets.
- Treat all network motion as decorative and support `prefers-reduced-motion: reduce`.
- Do not modify the lower-page section content or data.

---

### Task 1: Establish the hero behaviour contract

**Files:**
- Test: browser-rendered home route at `http://127.0.0.1:4173/`

**Interfaces:**
- Consumes: current Vite-rendered DOM.
- Produces: a red/green assertion contract for the redesign markers.

- [x] **Step 1: Start the existing site**

Run: `npm run dev -- --host 127.0.0.1 --port 4173`

Expected: Vite reports `http://127.0.0.1:4173/`.

- [x] **Step 2: Run the pre-implementation browser assertion**

Evaluate:

```js
JSON.stringify({
  headline: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim(),
  signalSystem: Boolean(document.querySelector('[data-hero-system="signal-network"]')),
  oldDashboard: Boolean(document.querySelector('.glow-border')),
})
```

Expected RED result: `signalSystem` is `false`, `oldDashboard` is `true`, and the headline is not “Make every signal count.”

### Task 2: Build the editorial hero and signal system

**Files:**
- Modify: `src/components/Hero.tsx`

**Interfaces:**
- Consumes: `CALENDLY_URL`, `useMagnetic`, `LogoMark`, and the `#who` section anchor.
- Produces: `Hero()` and a private `SignalSystem()` decorated with `data-hero-system="signal-network"`.

- [x] **Step 1: Replace the timer-driven cursor and dashboard implementation**

Implement a static React structure with this semantic contract:

```tsx
<section id="home">
  <p>Independent data & analytics consultant</p>
  <h1>Make every <em>signal</em> count.</h1>
  <p>I build the measurement systems behind confident product decisions...</p>
  <a href={CALENDLY_URL}>Schedule a call</a>
  <a href="#who">Explore the system</a>
  <SignalSystem />
</section>
```

- [x] **Step 2: Implement the decorative system graphic**

Build an inline SVG with six fixed flow paths feeding and leaving a central core, animated packets on those paths, source/outcome labels, three concentric rings, and a central `LogoMark`. Mark the entire graphic `aria-hidden="true"` and expose only `data-hero-system="signal-network"` for verification.

- [x] **Step 3: Add the proof line and scroll cue**

Render `8+ years`, `16 markets`, and `€2M+ uplift` as an inline bottom row, plus a compact `Scroll to explore` link to `#who`.

### Task 3: Replace the old hero visual system and retheme navigation

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/SiteNav.tsx`

**Interfaces:**
- Consumes: class names produced by `Hero.tsx` and the existing contact anchor.
- Produces: load, flow, orbit, scan, hover, responsive, and reduced-motion states; dark navigation over the light hero.

- [x] **Step 1: Remove dead hero CSS**

Delete rules used only by the old mesh, blooms, dot grids, dashboard graph, fake cursors, and hard-coded dashboard glow border. Preserve shared cursor glow, button streak, reveal, soft card glow, and lower-section styles.

- [x] **Step 2: Add the new CSS primitives**

Create classes for:

```css
.signal-hero {}
.signal-hero-aurora {}
.signal-hero-grid {}
.signal-system {}
.signal-ring {}
.signal-core {}
.signal-label {}
.signal-packet {}
.signal-scan {}
.signal-enter {}
```

Use only `transform`, `opacity`, `stroke-dashoffset`, and background-position for continuous motion. Add final-state rules under `@media (prefers-reduced-motion: reduce)`.

- [x] **Step 3: Retheme the fixed navigation**

Change the surface check so the navigation uses its light-surface treatment everywhere except while overlapping `#contact`:

```ts
const overContact = contact ? contact.getBoundingClientRect().top < 90 : false
setOnLight(!overContact)
```

- [x] **Step 4: Add responsive rules**

At `max-width: 1023px`, reduce system scale and headline size. At `max-width: 767px`, stack the hero, bound the network height, pull labels inward, and guarantee `overflow-x: clip`.

### Task 4: Verify the complete experience

**Files:**
- Verify: `src/components/Hero.tsx`
- Verify: `src/components/SiteNav.tsx`
- Verify: `src/index.css`

**Interfaces:**
- Consumes: completed implementation.
- Produces: fresh lint, build, DOM, console, responsive, and screenshot evidence.

- [x] **Step 1: Run static checks**

Run: `npm run lint && npm run build`

Expected: both commands exit `0` with no errors.

- [x] **Step 2: Run the post-implementation browser assertion**

Evaluate the Task 1 expression again.

Expected GREEN result: headline is “Make every signal count.”, `signalSystem` is `true`, and `oldDashboard` is `false`.

- [x] **Step 3: Verify browser health**

Check for `.vite-error-overlay`, confirm non-empty body text, inspect console errors, and confirm both hero links exist.

- [x] **Step 4: Verify responsive layouts**

Capture desktop, tablet, and mobile screenshots. At each size, verify the headline is readable, the signal system is not clipped incorrectly, the navigation remains legible, and `document.documentElement.scrollWidth === document.documentElement.clientWidth`.

- [x] **Step 5: Review the diff**

Run: `git diff --check && git diff --stat && git status --short`

Expected: no whitespace errors and only intentional hero/navigation/design-document changes.
