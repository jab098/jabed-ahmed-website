# Narrative Scroll Choreography Design

## Context

The site already uses native document scrolling, GSAP `ScrollTrigger`, full-viewport chapter introductions, pinned desktop process states, a pinned horizontal systems showcase, and sequential mobile layouts. The visual system is deliberate, but the journey between those scenes still depends on the physical characteristics of a visitor's mouse, trackpad, or touch gesture. A coarse wheel can jump too far, while a high-resolution trackpad can leave the page stranded between intended compositions.

Scrolling is therefore part of the site's permanent design language. A visitor provides directional intent and sees a small amount of direct movement; the site then completes the handoff to the next meaningful scene. No single physical gesture, however large or momentum-heavy, may skip an adjacent headline, story state, content scene, or required continuation stop.

## Goal

Create a reusable narrative-scroll system for wheel, trackpad, and single-touch vertical gestures that:

- preserves a short period of direct, user-controlled movement;
- settles smoothly on the immediately adjacent narrative waypoint;
- never advances more than one waypoint per physical gesture;
- includes full-scale headlines and every internal pinned or sequential story state;
- prevents tall content from being skipped by inserting readable continuation stops;
- remains extensible when sections are added, removed, resized, or expanded;
- keeps explicit navigation, keyboard use, zoom, controls, and nested scrolling predictable;
- records the behavior as a permanent design-language contract.

## Approaches Considered

### 1. CSS scroll snap

Root-level `scroll-snap-type` and `scroll-snap-stop` would be compact, but browser momentum handling varies, large deltas can still cross optional snap points, and DOM positions do not represent the virtual states inside GSAP-pinned chapters. It cannot provide a deterministic no-skipping guarantee across the current site.

### 2. Full virtual scrolling

Replacing document scrolling with a translated virtual surface would offer complete control, but it would duplicate browser behavior, complicate anchors, focus, restoration, zoom, and pinned scenes, and increase accessibility and maintenance risk.

### 3. Native document plus a narrative gesture director — selected

Keep the real document and the current GSAP timelines. A small controller claims eligible wheel and touch gestures, moves the real scroll position only within the current adjacent interval, and then settles on one target. Explicit DOM waypoints cover ordinary scenes; progress-based waypoints cover pinned states. Keyboard, scrollbar dragging, direct navigation, and unsupported cases remain native.

## Core Invariants

These invariants apply whenever the narrative director is enabled. Reduced-motion mode is the explicit accessibility exception and retains native scrolling as defined below.

1. **One gesture, one adjacent destination.** One wheel burst, trackpad gesture, or touch swipe can move only to the next or previous waypoint.
2. **No queued traversal.** Input received while a handoff is settling is absorbed. It never queues another destination.
3. **Momentum is part of the original gesture.** Trackpad momentum cannot become a second gesture after the first handoff.
4. **Headlines are destinations.** A section introduction is not merely content passed during a transition.
5. **Internal story states are destinations.** Every Process state and Systems scene is reachable independently.
6. **Tall content gets continuations.** The measured distance between adjacent stops must not exceed `82vh`; the waypoint builder inserts continuation stops where an authored scene is taller.
7. **Direct choices may skip.** Clicking a navigation link, CTA, process tab, system control, or Back to top is an explicit destination choice and may move directly to that target.
8. **Failure is native.** If the controller cannot build a valid stop map or safely claim an input, it does not prevent browser scrolling.

## Waypoint Model

### Authored DOM waypoints

Meaningful physical scenes expose a stable `data-scroll-waypoint` identifier on the element that aligns beneath the fixed navigation. Long scene containers expose `data-scroll-scene`, allowing the controller to derive continuation stops without adding empty markup.

Each identifier is unique and describes content rather than presentation, for example `process-heading`, `system-measurement`, or `contact`. Decorative sub-elements are never waypoints.

### Virtual pinned waypoints

The desktop Process and Systems timelines represent several narrative states at one pinned DOM position. Their `ScrollTrigger` instances receive stable IDs. Virtual waypoint declarations pair a trigger ID with a progress value, and resolve to:

`trigger.start + (trigger.end - trigger.start) * progress`

Process destinations land inside the stable range for states 01–04 rather than on a state boundary. Systems destinations derive progress from each card's horizontal position, so cards remain correct if their widths or gaps change.

### Continuation waypoints

After authored and virtual stops are resolved, any eligible scene span containing a gap larger than `0.82 * window.innerHeight` receives the minimum number of evenly spaced continuation stops required to bring every interval to `82vh` or less. Continuations belong to the scene, have deterministic IDs, and are regenerated after layout changes. They prevent a transition from visually passing a large unread portion of a section.

Stops are sorted by resolved scroll position and positions within four CSS pixels are deduplicated, preferring an authored headline or state over a generated continuation.

## Required Scene Inventory

### Desktop and fine-pointer layouts

- Hero headline and composition.
- Proof chapter.
- Process headline.
- Process states 01, 02, 03, and 04.
- Systems headline.
- Systems scenes 01, 02, 03, and 04.
- The `Build yours.` systems bridge.
- Capabilities headline.
- Each visible capabilities grid row.
- FAQ headline/list scene, plus derived continuations if its measured height requires them.
- Contact headline and actions.
- Footer signal scene.

### Mobile and touch layouts

- Hero headline/copy and the hero report as separate scenes when vertically stacked.
- Proof heading/artwork and each metric block when the strip becomes a vertical stack.
- Process headline followed by four physical sequential Process scenes. Mobile must not hide three stages behind one stateful panel.
- Systems headline, each vertically stacked System card, and the `Build yours.` bridge.
- Capabilities headline and each vertically stacked capability card.
- FAQ headline and each question row. An expanded answer remains part of its question scene and may create derived continuation stops.
- Contact headline/actions.
- Footer signal scene.

Responsive markup may share elements, but every item in the applicable inventory must resolve to an ordered destination. Structural tests must fail when an expected waypoint disappears.

## Wheel and Trackpad Interaction

1. Normalize `WheelEvent.deltaY` from pixel, line, or page units into CSS pixels.
2. Ignore `ctrl`-modified wheel events, horizontal-dominant gestures, nested scrollers that can still move in the requested direction, and input before the page loader completes.
3. On the first eligible event, determine the origin and the single adjacent target in the requested direction. When the page begins between authored stops because of scrollbar, keyboard, focus, or browser-driven movement, the current `scrollY` becomes a temporary origin and the first stop in the requested direction is the only target.
4. Prevent the browser from applying an unbounded delta. Set preview travel to `min(accumulatedIntent, intentThreshold)` and clamp it between the origin and the adjacent target. The preview can never grow past one threshold before commitment, even when several events arrive in one frame.
5. Accumulate directional intent. The threshold is `clamp(72px, 12vh, 120px)`.
6. If direction reverses before commitment, clear the previous directional accumulation and begin measuring the reverse direction from the current position.
7. Once the threshold is reached, settle on the adjacent target and mark the gesture committed.
8. If input becomes quiet before the threshold is reached, settle back to the origin so the page is never left between compositions.
9. After settling, remain disarmed until no wheel events have arrived for at least `180ms`. Every momentum event restarts this quiet timer.

A single event with a delta of thousands of pixels therefore produces at most the threshold-sized preview and one adjacent handoff.

## Touch Interaction

Touch uses the same adjacent-target state machine with direct finger tracking.

1. A single `touchstart` records the finger position without preventing a tap. If it begins between authored stops, the current `scrollY` becomes the temporary origin and the first stop in the eventual swipe direction becomes the only target.
2. The controller claims the gesture only after at least eight CSS pixels of movement and only when vertical travel is at least `1.25` times horizontal travel.
3. Multi-touch, pinch zoom, horizontal gestures, and gestures inside an eligible native nested scroller are never claimed. The site must not apply `touch-action: none` to `html` or `body`.
4. Once claimed, cancel native vertical momentum and move the real document one-to-one with the finger, clamped between the origin and the single adjacent target.
5. The commitment threshold is `clamp(56px, 10vh, 96px)` of vertical finger travel.
6. On release, settle to the adjacent target when committed; otherwise settle back to the origin.
7. A long or fast swipe cannot pass the adjacent target. A new destination requires a new touch after the current handoff completes and all touches have ended.

Tap activation remains intact because no default behavior is cancelled before the gesture is classified as a vertical swipe. Text inputs, textareas, selects, content-editable regions, pinch zoom, and browser edge gestures remain native.

## Handoff Animation

The handoff animates the real `window.scrollY` through an injectable scroll driver, using the existing GSAP runtime without a new dependency.

- Ease: `power3.inOut`.
- Duration: `clamp(520ms, 520ms + remainingDistance * 0.32ms, 980ms)`.
- The current partial movement is the animation's start; there is no snap back before moving forward.
- The final scroll position is corrected to the freshly resolved target on completion.
- The animation owns the interval until completion and does not queue wheel or touch requests.

The duration cap depends on the `82vh` continuation rule: normal destinations remain close enough to feel like a chapter handoff rather than an automated tour.

## Recalculation and Dynamic Content

Waypoint positions rebuild after:

- `DOMContentLoaded` and `document.fonts.ready`;
- the existing loader completion event;
- viewport resize or orientation change;
- a GSAP `ScrollTrigger` refresh;
- a `ResizeObserver` change within the main content or footer;
- FAQ disclosure transition completion.

Positions are precomputed and never measured inside a wheel or touch-move hot path. Rebuilds are scheduled once per animation frame. If layout changes during a handoff, the active animation stops, the map rebuilds, and the page resolves to the nearest valid stop without starting another traversal.

## Navigation and Existing Motion

- Existing anchors remain real links and keep their URL fragments.
- Explicit in-page links use the same handoff driver when motion is enabled, but are allowed to target any named waypoint directly.
- The controller starts only after `loader-complete` and does not alter the existing hard-refresh-to-top behavior.
- ScrollTrigger continues to own pinned state and horizontal-scene rendering; the director owns only gesture interpretation and destination travel.
- SiteNav progress and active-section logic continue to derive from the real document scroll position.
- Process tab clicks remain explicit direct choices. On mobile, sequential Process scenes expose the same content without requiring tabs.
- Scrollbar dragging, keyboard scrolling, focus-driven browser scrolling, and browser find remain native and are not force-snapped.

## Accessibility and Safety

- Under `prefers-reduced-motion: reduce`, narrative gesture interception is disabled and the browser retains immediate native scrolling. All authored content remains visible under the existing reduced-motion layout.
- Pinch zoom and multi-touch are never blocked.
- Focus is never moved as a side effect of a scroll handoff.
- No live-region announcements are added for routine scrolling.
- A vertical swipe beginning over a button or link can become a scroll after the eight-pixel classifier; an unclaimed tap still activates the control normally.
- A nested element with remaining scroll range consumes the gesture before the page director.
- Menu scroll locking and internal menu scrolling continue to take precedence.
- At the top and bottom boundaries, outward gestures are left native.
- Listener cleanup must restore fully native behavior after component unmount.

## Failure Handling

- Fewer than two valid destinations, non-finite positions, missing pinned triggers, or an unavailable animation runtime disables interception for the affected input.
- Missing virtual states do not remove surrounding physical waypoints; the page remains navigable.
- JavaScript failure leaves ordinary document scrolling and anchors intact.
- A stale or rebuilding map never calls `preventDefault` until a safe adjacent target has been resolved.
- The standalone privacy page does not mount the narrative director.

## Performance

- Add no new runtime dependency.
- Keep event handlers allocation-light and use one requestAnimationFrame write per frame.
- Cache waypoint geometry outside input hot paths.
- Use one `ResizeObserver` rooted around the narrative content rather than one observer per card.
- Register non-passive listeners only where cancellation is required and remove them on cleanup.
- Keep GSAP/ScrollTrigger refreshes debounced and never refresh on every scroll event.

## Permanent Design-Language Documentation

Implementation must add `docs/design-language/scroll-choreography.md` and link it from the repository README. The document must describe:

- the one-gesture/one-adjacent-waypoint invariant;
- how to mark a new headline, ordinary scene, tall scene, pinned state, and responsive scene;
- the `82vh` maximum-gap rule;
- wheel, trackpad, touch, reduced-motion, navigation, and nested-scroll behavior;
- the required test updates when a section is added or removed;
- a checklist requiring real desktop and mobile verification before release.

This design specification records the decision; the design-language document is the durable contributor-facing rule.

## Testing Contract

### Automated behavior tests

- A very large wheel delta advances exactly one destination.
- A burst plus a long momentum tail cannot advance twice.
- A fresh gesture after the quiet period can advance once more.
- Reverse input before commitment changes direction without crossing two stops.
- Sub-threshold wheel input returns to its origin after quiet.
- Pixel, line, and page wheel delta modes normalize consistently.
- A long touch drag is clamped to one adjacent destination.
- A short touch drag returns to its origin.
- Horizontal and multi-touch gestures remain unclaimed.
- Nested scrollers consume eligible input before the page.
- Reduced motion disables interception.
- Waypoints sort, deduplicate, and gain continuations so no eligible gap exceeds `82vh`.
- Layout rebuilds cancel stale handoffs and resolve to a valid destination.

### Structural tests

- The required desktop and mobile waypoint inventories are present.
- Process and Systems triggers expose stable IDs and all virtual states.
- Mobile exposes four sequential Process scenes.
- Footer, bridge, capability rows/cards, and FAQ destinations cannot silently disappear.
- The permanent design-language document is linked from README.

### Real-browser verification

- Test discrete mouse-wheel input and high-resolution trackpad input in both directions.
- Send a single extreme wheel delta and verify that it cannot skip a headline or state.
- Verify momentum rearming with a long trackpad flick.
- Verify short and long touch swipes at `390x844`, `375x812`, and `320x568`.
- Verify pinch zoom, horizontal gestures, taps, FAQ expansion, menu internal scroll, anchors, keyboard navigation, scrollbar dragging, and Back to top.
- Verify all four Process states and all four Systems scenes on desktop and mobile.
- Verify reduced-motion mode, loader completion, resize/orientation changes, and direct navigation.
- Confirm no horizontal overflow, browser-console errors, Vite overlay, trapped input, or stranded intermediate scroll position.
- Run focused tests, the full suite, lint, production build, and `git diff --check`.

## Scope Boundaries

- Do not replace the browser's document scroll with a transform-based virtual scroller.
- Do not add a smooth-scroll library or another runtime dependency.
- Do not change the site's colour, typography, content, or broader visual theme.
- Do not intercept keyboard scrolling, scrollbar dragging, browser find, focus-driven scrolling, pinch zoom, or explicit direct navigation.
- Responsive markup changes are limited to exposing the already-required sequential mobile Process states and reliable waypoint boundaries.
