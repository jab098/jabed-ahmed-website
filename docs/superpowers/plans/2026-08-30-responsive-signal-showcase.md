# Responsive Signal Showcase Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Keep the approved visual language intact.

**Goal:** Implement the six approved refinements as a local, reviewable visual experiment.

**Architecture:** Keep the React/GSAP section structure and authored desktop scrolling. Add an isolated canvas artwork with an original-graph comparison, explicit sequence controls, and content-safe responsive styles. Preserve the normal two-stage loader and all brand colours; repair deep-link and return navigation independently of its animation.

**Tech Stack:** Existing React, TypeScript, GSAP, CSS and Vitest; no new dependencies.

**Spec:** User-approved six-point executive overview in this task, with the explicit amendment to preserve theme, contrast styling and two-stage opening animation.

## Delivery / 30 August 2026

Implementation complete for local review. The default hero is the signal-field experiment; Original graph remains selectable. Brand tokens, copy, typography families and the two-stage entrance are retained. No deployment or commit was made.

Verification: 137 tests across 20 files pass; production build, lint and whitespace checks pass. Browser checks covered 320×568, 390×844, 768×1024, 844×390, 900/901px, 1024×768, 1440×900 and 1920×1080. No page-width overflow or example-body clipping was found. All four process figures fit at 320px after the dense fourth graphic was adjusted. Artwork controls, original palette switching, the landscape menu, direct hash reload, and example selection were exercised. Console checks found no warnings or errors.

Keyboard focus containment, reduced-motion controls, hidden-tab suspension, and horizontal-versus-vertical touch intent have regression coverage. Physical iOS/Android hardware and assistive-technology testing remain useful follow-up validation; viewport testing is not hardware testing. An independent review agent was unavailable, so the final code review was performed directly.

Local preview: http://127.0.0.1:5173/ on `codex/responsive-signal-showcase`. Existing unrelated `.claude-flow` changes are preserved.

The checklist below records the implementation work packages; the delivery notes above record the verified result.

## Global Constraints

**Final user amendment / 31 August 2026:** The user approved merging the website refinements into remote `main` after removing the Original graph comparison, both comparison buttons, and the explanatory captions. The final hero retains the layered sculpture, Reshape/Pause, the mobile exit fade and the unchanged two-stage entrance. This supersedes the trial-only comparison and uncommitted-work constraints below; earlier delivery notes describe the historical local trial.

- Preserve `#ff5a1f`, `#11100f`, `#f1f0ec`, typography, copy and the two-stage entrance.
- No decision briefs, CV changes, case studies, conversion redesign or public deployment.
- Keep existing `.claude-flow` changes untouched. Work on `codex/responsive-signal-showcase` in the existing checkout for straightforward localhost review.
- Original graph remains available through an artwork comparison control.
- Leave changes uncommitted for the user's test decision.

## Task 1: Artwork and mobile composition

**Files:** New `src/signalField.ts`, `src/components/SignalField.tsx`, `src/components/HeroArtwork.tsx`, `src/styles/signal-field.css`; modify Hero and hero styles.

**Interfaces:** `SignalField({ active: boolean })`; `HeroArtwork({ active: boolean })`; pure `getSignalPoint(u, v, time, formation)` returns normalised x/y/depth. State has three authored formations. Canvas uses existing backing-store budget, offscreen/document-visibility suspension, and reduced-motion handling.

- [ ] Add failing behavioural tests: default signal field, switch to original graph and back, next formation, pause/resume, finite geometry and distinct formations.
- [ ] Run focused Vitest tests and confirm missing-feature failures.
- [ ] Implement the geometry, canvas lifecycle and labelled controls. Keep pointer interaction out of React state; use deliberate buttons for touch changes.
- [ ] Integrate the visual into the mobile hero grid between headline and body; remove its standalone scroll destination. Keep desktop split and headline reveal.
- [ ] Re-run tests and inspect the real browser at phone, tablet and desktop sizes.

## Task 2: Sequence control and examples

**Files:** `src/useAutoAdvance.ts`, new hook tests, Process, SystemsShowcase and their tests/styles.

**Interfaces:** `useAutoAdvance(root, advance, held)` returns `{ paused, pause, resume, defer }`. Manual selection calls `pause`; hover leave calls `defer`; reduced motion disables autoplay.

- [ ] Write failing tests proving manual selection persists beyond multiple timer intervals and Resume restarts the sequence.
- [ ] Keep four-second ambient sequence behaviour; add pause/resume and previous/next controls. Add labelled selection buttons and horizontal touch gestures with a vertical-intent guard.
- [ ] Treat the closing panel as a labelled finale and a real Contact link. Mark illustrative data on each example. Remove misleading card arrows.
- [ ] Preserve selected keyboard focus and keep focused controls from being translated offscreen.
- [ ] Verify timers, selection, touch direction handling and reduced motion with focused tests.

## Task 3: Navigation and responsive corrections

**Files:** SiteNav, PageLoader, loader bootstrap, capabilities, responsive styles and associated tests.

**Interfaces:** The loader retains the full approved entrance, preserves hashes, and settles direct anchors on completion. Native Back/Forward restoration is enabled and is not overridden by a forced scroll-to-top.

- [ ] Write failing tests for preserved section links, fallback cleanup, and Close participating in the menu focus loop.
- [ ] Restore native history scroll restoration; settle valid initial anchors after the entrance; do not clear hashes or force top on return.
- [ ] Make the menu internally scrollable; add a Close button inside the dialog, background inertness, and focus-visible navigation.
- [ ] Remove redundant capability focus stops; associate disclosure controls with their content and give expansions natural height.
- [ ] Add short-height layouts for system cards and process graphics, fluid tablet hero sizing, comfortable footer targets and complete reduced-motion coverage without recolouring the theme.
- [ ] Run relevant tests and browser checks for menu, anchors, disclosures and all process states.

## Task 4: Verification and preview

- [ ] Run `npm test -- --run`, `npm run lint`, `npm run build`, `git diff --check`.
- [ ] Inspect 320×568, 390×844, 768×1024, 844×390, 900/901px, 1024×768, 1440×900 and 1920×1080. Check content bounds, not only page overflow.
- [ ] Check normal two-stage loading, artwork comparison, controls, menu scrolling, all process/example states and direct hash navigation. Review hooks and canvas cleanup.
- [ ] Update interaction documentation for revised behaviours; report any remaining physical-device test limitations.
- [ ] Leave a localhost server running, open it in Codex, and give the user the preview URL.
