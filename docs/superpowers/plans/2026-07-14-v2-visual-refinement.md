# V2 Visual Refinement Implementation Plan

> **For agentic workers:** Execute inline in the current workspace. The user explicitly requested no commit.

**Goal:** Remove the remaining clipping and reveal defects while improving the hero analytics asset, process audit, system diagrams, scroll accents, copy, and V2 favicon.

**Architecture:** Keep the current React/Vite/GSAP structure. Treat the hero graph as a staged child animation controlled by `Hero`, use SVG for clear structural diagrams, retain canvas glyphs as a secondary texture, and attach scrubbed colour changes to existing GSAP scroll triggers.

**Tech Stack:** React 19, TypeScript, GSAP/ScrollTrigger, CSS, Canvas 2D, SVG, Vitest/Testing Library.

## Global Constraints

- Preserve the orange, ink, and paper V2 palette.
- Keep the executive decision dashboard unchanged.
- Do not commit.
- Keep the production preview running on localhost.

---

### Task 1: Regression contracts

**Files:**
- Modify: `src/components/Hero.test.tsx`
- Modify: `src/components/Process.test.tsx`
- Modify: `src/components/SystemsShowcase.test.tsx`
- Modify: `src/components/Contact.test.tsx`

- [x] Assert the hero exposes content-width wipe lines, tracking-led copy, and a staged analytics report.
- [x] Assert the audit includes a three-item summary.
- [x] Assert the architecture and pipeline visuals expose explicit SVG routes.
- [x] Assert the contact and end-card scroll accent words have dedicated hooks.
- [x] Run the focused tests and confirm they fail because the new structures are absent.

### Task 2: Hero and analytics asset

**Files:**
- Modify: `src/components/Hero.tsx`
- Modify: `src/components/GlyphReport.tsx`
- Modify: `src/styles/hero.css`

- [x] Make each reveal mask fit its text content instead of spanning the copy column.
- [x] Start the canvas only when the hero timeline reaches the graph reveal.
- [x] Add a borderless SVG grid, bars, two trend lines, labels, and a pointer-driven probe.
- [x] Interpolate canvas palette colours over roughly 600ms on click.
- [x] Replace magnification with a probe/inspection interaction.

### Task 3: Audit and system diagrams

**Files:**
- Modify: `src/components/Process.tsx`
- Modify: `src/styles/process.css`
- Modify: `src/components/SystemsShowcase.tsx`
- Modify: `src/styles/systems.css`

- [x] Add a concise audit footer for signals checked, blockers, and next action.
- [x] Replace the first card's two-pane visual with a connected event-contract architecture.
- [x] Reduce the second card title scale enough to protect its right gutter.
- [x] Replace the third card's wave with a routed browser-to-activation pipeline.
- [x] Leave the fourth card markup and styling unchanged.

### Task 4: Scroll accents and clipping

**Files:**
- Modify: `src/components/SystemsShowcase.tsx`
- Modify: `src/components/Contact.tsx`
- Modify: `src/styles/systems.css`
- Modify: `src/styles/contact-footer.css`
- Modify: `src/styles/capabilities-faq.css`
- Modify: `src/styles/process.css`
- Modify: `src/styles/hero.css`

- [x] Scrub `yours` from paper to orange as the horizontal track reaches its end.
- [x] Scrub `your` from ink to orange and back to ink through the contact section.
- [x] Expand the capabilities and process reveal masks around descenders.
- [x] Expand the rolling metric reel mask without changing its number animation.

### Task 5: V2 brand assets and verification

**Files:**
- Modify: `public/favicon.svg`
- Modify: `README.md`
- Exclude from the current build: legacy `public/website.png`

- [x] Replace the rounded green V1 favicon with a square orange/ink `JA` mark.
- [x] Remove the stale V1 screenshot reference and exclude the legacy public directory from the current build.
- [x] Run lint, all tests, the production build, and `git diff --check`.
- [x] Verify the loader/hero sequence, graph hover/click, affected scroll sections, and responsive clipping in the localhost browser.
