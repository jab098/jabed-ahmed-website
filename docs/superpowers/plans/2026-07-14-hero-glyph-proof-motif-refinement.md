# Hero Glyph, Proof Metric and Motif Refinement Implementation Plan

> **For agentic workers:** Execute inline in the current workspace. The user explicitly requested no commit and has standing approval for scoped V2 refinements.

**Goal:** Remove human-readable content from the hero graphic, eliminate proof metric reel clipping, and restore the animated CRO `03` motif.

**Architecture:** Keep the current React, canvas and SVG composition. Use discrete SVG geometry as the structural rising signal, route all three proof metrics through a static reveal component, and expose motif numbers through a stable selector outside any destructive clip-path.

**Tech Stack:** React 19, TypeScript, CSS, Canvas 2D, SVG, Vitest/Testing Library.

## Global Constraints

- Preserve the orange, ink and paper V2 palette.
- Preserve the hero glyph texture, probe and smooth colour interaction.
- Do not change the executive dashboard.
- Do not commit.
- Keep the localhost production preview running.

---

### Task 1: Regression contracts

**Files:**
- Modify: `src/components/Hero.test.tsx`
- Modify: `src/components/Metrics.test.tsx`
- Modify: `src/components/Capabilities.test.tsx`

- [x] Assert the hero structure contains no visual text or conventional line and contains at least 24 signal pieces.
- [x] Assert every proof value uses a static metric hook with no digit reels.
- [x] Assert the CRO card exposes a dedicated `03` motif number.
- [x] Run the focused tests and confirm the new assertions fail for the expected missing structures.

### Task 2: Minimal implementation

**Files:**
- Modify: `src/components/GlyphReport.tsx`
- Modify: `src/components/Metrics.tsx`
- Modify: `src/components/Capabilities.tsx`
- Modify: `src/styles/hero.css`
- Modify: `src/styles/capabilities-faq.css`

- [x] Replace hero labels and trend paths with independent geometric signal pieces.
- [x] Remove the probe readout and bottom captions while keeping the crosshair.
- [x] Route all proof metrics through the static-value reveal.
- [x] Remove the whole-motif clip from card three and animate its explicit number hook.
- [x] Run focused tests until green.

### Task 3: Verification

**Files:**
- Verify: localhost production build

- [x] Run lint, all tests, build and `git diff --check`.
- [x] Inspect the hero, proof strip and third capability card at the supplied desktop width.
- [x] Confirm mobile overflow remains zero and browser logs contain no errors.
