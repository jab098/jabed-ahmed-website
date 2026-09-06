# Kinetic Capability Compositions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorder Front-End Instrumentation to capability 01 and make all six capability selections use distinct, animated compositions without changing their demonstration artwork.

**Architecture:** Add stable demo and layout slugs to capability data so the artwork is no longer coupled to array position. Keep a current and outgoing panel in `Capabilities`, with a cancellable 480ms lifecycle, and drive each desktop composition through data attributes and CSS custom properties. Mobile collapses those variants back to one readable stack.

**Tech Stack:** React 19, TypeScript, CSS, Vitest, Testing Library, Vite

**Spec:** `docs/superpowers/specs/2026-09-06-kinetic-capability-compositions-design.md`

## Global Constraints

- Do not change the internal markup, labels, values or motion of the six demonstration frames.
- Front-End Instrumentation is capability 01 and is selected by default.
- The evidence strip remains implemented but absent from the rendered page.
- Selection motion uses the existing 480ms restrained state-transition language.
- Preserve keyboard tab selection, reduced motion and the horizontal mobile selector.
- Work in the existing dirty checkout without committing or modifying unrelated files.

---

### Task 1: Stable capability identity and approved order

**Files:**
- Modify: `src/data.ts`
- Modify: `src/components/CapabilityDemonstration.tsx`
- Test: `src/components/Capabilities.test.tsx`

**Interfaces:**
- Consumes: the existing six capability records and six demonstration components.
- Produces: `CapabilityDemoSlug`, `CAPABILITIES[*].demo`, `CAPABILITIES[*].layout`, and `CapabilityDemonstration({ demo })`.

- [ ] **Step 1: Write the failing ordering and mapping test**

Assert that the first tab is `01 Front-End Instrumentation`, the first active tabpanel contains the Front-End copy and QA demo, the remaining tab names are numbered in the approved order, and every rendered demonstration slug follows the same order.

- [ ] **Step 2: Run the component test and verify the old Tag Management ordering fails**

Run: `npm test -- --run src/components/Capabilities.test.tsx`

Expected: FAIL because `01 Tag Management` is initially selected and demonstration rendering is index-coupled.

- [ ] **Step 3: Add stable slugs and reorder the data**

Add literal `demo` and `layout` fields to every capability record, reorder Front-End first, renumber all six records, replace the demonstration array with a slug-keyed component map, and pass the capability's demo slug from `Capabilities`.

- [ ] **Step 4: Run the component test and verify the ordering contract passes**

Run: `npm test -- --run src/components/Capabilities.test.tsx`

Expected: PASS with Front-End selected first and all six demonstrations matched by slug.

### Task 2: Current and outgoing composition layers

**Files:**
- Modify: `src/components/Capabilities.tsx`
- Test: `src/components/Capabilities.test.tsx`

**Interfaces:**
- Consumes: `CAPABILITIES[*].layout` and the existing click/arrow-key handlers.
- Produces: panel `data-layout` and `data-panel-state` attributes plus a cancellable 480ms outgoing-panel lifecycle.

- [ ] **Step 1: Write failing transition behavior tests**

Using fake timers, assert that a selection change exposes one current tabpanel, retains the old panel as an `aria-hidden` outgoing layer for 480ms, removes it after the timer, and cancels stale cleanup across a rapid second selection.

- [ ] **Step 2: Run the focused tests and verify the outgoing layer is missing**

Run: `npm test -- --run src/components/Capabilities.test.tsx`

Expected: FAIL because inactive panels are immediately hidden and no transition state exists.

- [ ] **Step 3: Implement the layer lifecycle**

Track the previous capability, clear the active cleanup timer before every selection, render only current and outgoing panels, mark outgoing content inert and `aria-hidden`, preserve a single semantic tabpanel, and clean up the timer on unmount.

- [ ] **Step 4: Run the component tests and verify transition behavior passes**

Run: `npm test -- --run src/components/Capabilities.test.tsx`

Expected: PASS with no stale outgoing layer after rapid selection.

### Task 3: Kinetic layouts, responsive fallback and release verification

**Files:**
- Modify: `src/styles/capabilities-faq.css`
- Modify: `src/styles/viewportFrames.test.ts`
- Modify: `docs/design-language/scroll-choreography.md`

**Interfaces:**
- Consumes: `data-layout` and `data-panel-state` from `Capabilities`.
- Produces: six desktop composition profiles, authored enter/exit directions, the signal rail, a consistent mobile stack and reduced-motion final states.

- [ ] **Step 1: Write failing responsive composition tests**

Assert that desktop CSS addresses all six layout slugs, current and outgoing states use the 480ms transition, mobile resets frame/copy positioning into the shared stack, and reduced motion disables panel transforms and transition duration.

- [ ] **Step 2: Run the viewport tests and verify the composition rules are absent**

Run: `npm test -- --run src/styles/viewportFrames.test.ts`

Expected: FAIL because the current CSS gives every capability one fixed frame position.

- [ ] **Step 3: Implement the six composition profiles**

Add panel-level variables for demo bounds, copy bounds, enter and exit vectors, apply them to frame and copy positioning, animate the current/outgoing layers, add the orange signal rail, reset variants below 900px, and disable local transition motion under reduced motion.

- [ ] **Step 4: Document the capability composition behavior**

Update the component-motion section to describe stable per-capability compositions, outgoing/current layers, keyed demo identity, the mobile stack and reduced-motion behavior.

- [ ] **Step 5: Run automated verification**

Run: `npm test -- --run && npm run lint && npm run build && git diff --check`

Expected: all tests pass, lint reports no errors, the production build exits 0 and the diff has no whitespace errors.

- [ ] **Step 6: Verify the complete page in the browser**

Open the local Vite site and inspect `1440x900`, `1512x839`, `900x1024`, `390x844`, `375x812`, and `844x390`. Select all six capabilities, including rapid changes, and confirm the frame and copy visibly recompose on desktop, remain stacked on mobile, match the active tab, have no horizontal page overflow, and produce no error overlay or console errors.
