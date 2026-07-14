# Motion Density and Method Refinement Implementation Plan

> **For agentic workers:** Execute inline in the current workspace. The user has explicitly requested continuous execution, no subagents and no commit.

**Goal:** Polish menu and scroll motion, fix hero glyph clipping and entrance timing, rebuild the final method visual, and raise the hero report to reference-level density and pointer response.

**Architecture:** Keep interaction ownership inside the existing React components. Use CSS transitions for menu staging, GSAP for load/scroll choreography, Canvas for dense glyph physics, SVG for the chart skeleton, and static SVG paths for the favicon.

**Tech Stack:** React 19, TypeScript, GSAP/ScrollTrigger, Canvas 2D, SVG, CSS, Vitest/Testing Library.

## Global Constraints

- Preserve ink, paper and `#ff5a1f` signal orange.
- Add no runtime dependency.
- Preserve keyboard, reduced-motion and click-palette behaviour.
- Do not commit.
- Keep `http://localhost:4173/` available as a production preview.

---

### Task 1: Regression contracts

**Files:**
- Modify: `src/components/SiteNav.test.tsx`
- Modify: `src/components/Hero.test.tsx`
- Modify: `src/components/Process.test.tsx`
- Modify: `src/components/SystemsShowcase.test.tsx`
- Modify: `src/components/Contact.test.tsx`

**Interfaces:**
- Produces stable DOM hooks for menu fades, safe headline masks, dense glyph configuration, decision-release content and tight scroll flashes.

- [x] Add a navigation assertion requiring `[data-menu-fade]` on the header, footer and every menu link row.
- [x] Add hero assertions requiring `data-hero-visual-entrance="soft"`, `data-reveal-safe` on all three text lines, and a dense report configuration with spacing no greater than 8px and ambient divisor 3.
- [x] Add a process assertion that step four renders `[data-release-decision]`, a winner/control comparison, `+18.4%`, `96%`, guardrail state and an evidence-to-owner handoff.
- [x] Add systems/contact assertions for `data-scroll-flash="early-tight"` and `data-scroll-flash="tight"`.
- [x] Run the five focused test files and confirm each new assertion fails for the missing contract.

### Task 2: Menu, scroll accents and favicon

**Files:**
- Modify: `src/components/SiteNav.tsx`
- Modify: `src/styles/navigation.css`
- Modify: `src/components/SystemsShowcase.tsx`
- Modify: `src/components/Contact.tsx`
- Modify: `src/assets/favicon.svg`
- Modify: `public/favicon.svg`

**Interfaces:**
- Consumes the stable hooks from Task 1.
- Produces opacity-staged menu content, earlier signal-orange ramps and a thin inset JA mark.

- [x] Mark the menu header, link rows and footer with `data-menu-fade`, then give them closed-state opacity/translation and staggered open-state transitions that reverse cleanly on close.
- [x] Change the desktop `yours.` trigger to begin beyond the right edge and complete just after entry; tighten scrub and use `#ff5a1f`. Apply an equivalent early, short trigger range on mobile.
- [x] Shorten the contact flash range and orange ramp, add a brief full-orange hold, then return to ink.
- [x] Replace both favicon letter blocks with matching inset, unfilled JA paths using a thin ink stroke.
- [x] Run the focused navigation, systems and contact tests until green.

### Task 3: Hero clipping and entrance

**Files:**
- Modify: `src/components/Hero.tsx`
- Modify: `src/styles/hero.css`
- Test: `src/components/Hero.test.tsx`

**Interfaces:**
- Produces a soft hero-panel entrance and a reveal mask that is removed after animation.

- [x] Add `data-reveal-safe` and expand the line/text safety inset on the right and bottom without changing the wipe width.
- [x] After each wipe passes, set the text clip path to `none` so negative tracking cannot crop final glyph overhangs.
- [x] Prime `.hero-visual` with both a closed horizontal mask and zero opacity; reveal its mask and opacity together over at least 1.1 seconds.
- [x] Preserve the reduced-motion immediate state.
- [x] Run the hero test until green.

### Task 4: Dense pointer-reactive hero report

**Files:**
- Modify: `src/components/GlyphReport.tsx`
- Modify: `src/styles/hero.css`
- Test: `src/components/Hero.test.tsx`

**Interfaces:**
- Produces `GLYPH_FIELD_CONFIG`, which the report renderer and test both consume.
- Maintains the existing `data-palette` and `data-palette-transition="smooth"` interface.

- [x] Export a frozen field configuration with desktop spacing 8px, ambient divisor 3, a 6–9px font range, pointer radius 24% of the shorter edge and a 12px maximum parallax offset.
- [x] Retain one third of ambient chart points and assign deterministic depth, glyph index and next-mutation timing to every point.
- [x] Smooth a global pointer parallax target and add depth-scaled offsets to each point’s spring home.
- [x] Increase the local pointer radius, preserve spring return, and mutate nearby glyphs at deterministic 450–1200ms intervals while hovering.
- [x] Blend nearby glyphs toward a per-palette paper/orange hover colour with a soft falloff.
- [x] Drive shallow SVG translation through pointer CSS variables and ease back to zero on exit.
- [x] Keep click colour changes on the existing 680ms interpolated palette transition.
- [x] Disable pointer movement/mutation when reduced motion is requested.
- [x] Run the hero test until green.

### Task 5: Decision-release method visual

**Files:**
- Modify: `src/components/Process.tsx`
- Modify: `src/styles/process.css`
- Test: `src/components/Process.test.tsx`

**Interfaces:**
- Produces `[data-release-decision]` containing comparison, confidence, guardrails, rollout and ownership handoff.

- [x] Replace the six anonymous bars with a labelled control/winner comparison and staggered series reveal.
- [x] Add a compact metric row for lift, confidence and rollout.
- [x] Add stable revenue/quality guardrails and an evidence → decision → owner strip.
- [x] Keep the headline visually dominant and support the existing clipped orange panel geometry.
- [x] Add reduced-motion rules for every new reveal.
- [x] Run the process test until green.

### Task 6: Verification and preview

**Files:**
- Verify: current workspace and localhost production build.

- [x] Run `npm run lint`.
- [x] Run `npm test -- --run` and confirm all files pass with zero failures.
- [x] Run `npm run build` and confirm TypeScript/Vite exit successfully.
- [x] Run `git diff --check` and scan for stale old chart/menu selectors.
- [x] Inspect loader-to-hero, menu open/close, both scroll flashes, process step four and hero pointer movement at 1280×720 and 390×844.
- [x] Confirm zero horizontal overflow, no console errors and `http://localhost:4173/` returns HTTP 200.
- [x] Leave the browser at the desktop hero and keep the preview tab as the deliverable.
