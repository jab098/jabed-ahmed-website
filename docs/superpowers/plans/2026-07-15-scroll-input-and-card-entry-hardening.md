# Scroll input and card entry hardening implementation plan

**Goal:** Remove unsolicited FAQ movement, accept a genuinely new gesture during an in-flight handoff without section skipping, and give card compositions a clean opacity entrance.

**Architecture:** Extend `NarrativeGestureDirector` with one semantic follow-on intent slot separated from momentum by the existing `180ms` quiet boundary. Keep FAQ state changes inside fixed geometry and disable native anchoring while narrative scrolling owns the document. Observe Capability and System cards individually and simplify Process state motion to opacity.

**Tech stack:** React 19, TypeScript, GSAP/ScrollTrigger, CSS, Vitest, Testing Library, headless Chrome/CDP.

---

### Task 1: Lock the gesture contract with tests

**Files:**
- Modify: `src/narrativeScroll.test.ts`

1. Add a failing asynchronous-animation test that fires the quiet timer during a handoff, supplies a second large wheel gesture, completes the first animation, and expects the adjacent second animation.
2. Add coverage proving continuous momentum and repeated queued deltas cannot reserve more than one destination.
3. Add opposite-direction and second-touch coverage so both directions and mobile remain usable.

### Task 2: Implement one-slot follow-on intent

**Files:**
- Modify: `src/narrativeScroll.ts`

1. Replace the destructive rearm flag with explicit wheel-stream quiet state and one queued wheel intent.
2. Accumulate only the stream that starts after a quiet boundary; keep absorbing the current stream's tail.
3. Resolve and start at most one adjacent semantic destination after the current landing.
4. Capture one committed blocked touch gesture and run it from the settled destination.
5. Clear all queued state on destroy, direct navigation, and invalid boundaries.

### Task 3: Stabilize FAQ layout and scroll position

**Files:**
- Modify: `src/styles/base.css`
- Modify: `src/styles/capabilities-faq.css`
- Modify: `src/components/Faq.test.tsx`

1. Disable browser scroll anchoring only while narrative scrolling is active.
2. Replace hover/open padding animation with child transforms inside the fixed button grid.
3. Add a structural regression assertion for the stable motion hooks and verify in Chrome that hover/accordion actions do not change `window.scrollY`.

### Task 4: Give cards per-composition fades

**Files:**
- Modify: `src/components/Capabilities.tsx`
- Modify: `src/components/Capabilities.test.tsx`
- Modify: `src/components/SystemsShowcase.tsx`
- Modify: `src/components/SystemsShowcase.test.tsx`
- Modify: `src/styles/capabilities-faq.css`
- Modify: `src/styles/process.css`
- Modify: `src/styles/systems.css`

1. Observe Capability cards individually and mark each visible once.
2. Observe System cards individually in both pinned desktop and stacked mobile layouts.
3. Make both card families opacity-only reveals and keep reduced motion immediate.
4. Replace Process copy/display lateral and skew entrances with professional opacity fades.

### Task 5: Update design language and verify the live build

**Files:**
- Modify: `docs/design-language/scroll-choreography.md`

1. Document the quiet-boundary follow-on gesture rule, layout-neutral FAQ rule, and per-composition fade rule.
2. Run focused tests, the complete test suite, lint, build, and `git diff --check`.
3. Rebuild the existing preview and verify the reported paths in Chrome at desktop and mobile sizes, including rapid repeated input, FAQ hover/open/close, console output, and horizontal overflow.
