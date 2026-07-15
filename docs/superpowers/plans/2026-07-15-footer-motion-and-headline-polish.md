# Footer, motion, and headline polish implementation plan

> **For Codex:** Execute this plan in order with red-green-refactor checks, then run the full browser-verification matrix.

**Goal:** Land the Footer as a complete viewport composition, soften every automated scroll handoff without changing duration, and ensure scroll-revealed headlines are fully settled at their authored stops on all viewport heights.

**Architecture:** Preserve the single narrative waypoint/controller pipeline. Extend physical waypoint metadata with an opt-in viewport alignment, centralize the easing map and responsive reveal endpoint helpers, and make the three GSAP headline timelines share the same navigation-edge endpoint used by waypoint geometry.

**Tech stack:** React 19, TypeScript, GSAP/ScrollTrigger, Vitest/Testing Library, Vite, Chrome DevTools Protocol.

---

## Task 1: Specify Footer viewport alignment with failing tests

**Files:**
- Modify: `src/components/NarrativeScroll.test.tsx`
- Modify: `src/components/Contact.test.tsx`

1. Add a collector test with one default physical waypoint and one `data-scroll-align="viewport"` waypoint. Assert the default subtracts the navigation height and the viewport-aligned point does not.
2. Add a Contact structural assertion that the Footer declares `data-scroll-align="viewport"`.
3. Run the focused tests and confirm both fail for the missing behavior.

## Task 2: Specify the motion and reveal endpoint contracts with failing tests

**Files:**
- Modify: `src/components/NarrativeScroll.test.tsx`
- Create: `src/motion.test.ts`

1. Update the shared handoff ease expectations to `sine.out`, `sine.inOut`, and `sine.inOut` for continuation, return, and direct modes.
2. Add tests for a navigation-edge ScrollTrigger endpoint helper: measured navigation height returns `top Npx`; a missing nav returns `top 0px`.
3. Run the focused tests and confirm the new expectations fail before implementation.

## Task 3: Implement Footer alignment and refined handoff curves

**Files:**
- Modify: `src/narrativeScrollDom.ts`
- Modify: `src/components/Contact.tsx`
- Modify: `src/narrativeScrollAdapter.ts`

1. Read `data-scroll-align` in the physical collector and subtract zero for `viewport`; preserve navigation-height subtraction as the default.
2. Mark the Footer waypoint with `data-scroll-align="viewport"`.
3. Replace the mixed power easing branches with the approved sinusoidal mapping; do not alter duration helpers.
4. Route preview, continuation, return, and direct GSAP frame writes through an explicit `behavior: "instant"` browser adapter so native smooth scrolling cannot compound the designed animation.
5. Run the Task 1 and Task 2 narrative tests to green.

## Task 4: Align all scroll-scrubbed headline reveals to the authored stop

**Files:**
- Modify: `src/motion.ts`
- Modify: `src/components/Process.tsx`
- Modify: `src/components/SystemsShowcase.tsx`
- Modify: `src/components/Contact.tsx`
- Test: `src/motion.test.ts`

1. Export a helper that measures `.site-nav` and returns the ScrollTrigger position `top <height>px`.
2. Use the helper as the functional `end` for Process, Systems, and Contact headline reveals.
3. Set `invalidateOnRefresh: true` on each timeline so rotation, resize, and breakpoint changes recalculate the endpoint.
4. Run the motion and component tests to green.

## Task 5: Document the reusable design language

**Files:**
- Modify: `docs/design-language/scroll-choreography.md`

1. Document `data-scroll-align="viewport"` as an explicit full-viewport composition exception.
2. Document the sinusoidal velocity profile while stating that duration remains distance-adaptive and unchanged.
3. Document that scroll-scrubbed headline reveals must end at the same responsive navigation edge used by their physical waypoint.

## Task 6: Verify behavior and finish the localhost preview

**Files:**
- Verify only unless a defect is found.

1. Run `npm test -- --run`, `npm run lint`, and `npm run build`.
2. Serve the fresh `dist` at `http://127.0.0.1:4173/`.
3. At a 1024×573 DPR-2 viewport, verify the Footer top is within one device pixel of zero at the final waypoint and the bottom row is inside the viewport.
4. At short desktop, standard desktop, and mobile viewports, visit each authored headline stop and verify Process, Systems, and Contact child transforms settle to zero.
5. Exercise large wheel input and touch input; verify each gesture advances at most one destination and automated motion uses the shared easing profile.
6. Verify no blank page, Vite overlay, console errors, horizontal overflow, or reduced-motion regression.
7. Request an independent code review, address any important finding, rerun affected checks, and commit the completed implementation.
