# Scroll choreography

Scroll is part of the site's design language. The document remains a real, native page, but eligible wheel, trackpad, and single-touch vertical gestures are interpreted as intent to move between authored narrative compositions.

## Invariant

One physical gesture may reach only the immediately adjacent authored waypoint in its direction.

- A restrained amount of direct movement is shown first, then the site completes the handoff.
- A very large wheel delta, fast swipe, or momentum tail cannot skip a headline, card, or scene.
- Continuous input from the gesture that started a handoff is absorbed as momentum.
- After wheel input has been quiet for at least `180ms`, a new stream is a fresh gesture and may reserve exactly one adjacent move even if the current handoff is still finishing.
- A new committed single-touch swipe may likewise reserve one adjacent move after the current landing. A short second swipe reserves nothing.
- Full headline, card, state, bridge, Contact, and Footer compositions are destinations—not content to pass over.
- Geometry never invents a destination between two authored compositions.

Explicit choices are different from gestures. A real navigation link, CTA, or pinned-scene tab may select a non-adjacent destination, but site-owned choices still use the same smooth GSAP handoff. Browser find results, keyboard actions, the skip link, and scrollbar dragging remain native.

## Declaring scenes and waypoints

Every top-level narrative chapter declares a stable scene boundary:

```tsx
<section id="services" data-scroll-scene="services">...</section>
```

The current page owns eight scenes: Home, Proof, Process, Systems, Capabilities, FAQ, Contact, and Footer. New top-level sections must add their own `data-scroll-scene` identifier and update the structural inventory test.

`data-scroll-scene` records semantic chapter ownership only. It is not a scroll destination, and its height or boundaries never generate stops.

Add a stable content-based identifier to each complete physical composition:

```tsx
<header data-scroll-waypoint="services-heading">...</header>
<section data-scroll-waypoint="contact">...</section>
```

Names describe the content, not its visual position. Keep them unique. Only declare a waypoint when the viewport at that position forms a complete, intentional composition.

Do not mark:

- section eyebrows such as `// How I work`, `// The method`, `// Working systems`, or `// Inside the system`;
- small running labels such as `JA / DATA`;
- decorative artwork or the left visual inside a card;
- arbitrary spacer positions or empty intervals;
- a partial view whose only purpose is to approach the next complete composition.

Those elements remain visible inside their containing composition. A tall chapter is allowed to have a large distance between its authored destinations; distance alone is never a reason to add a stop.

The collector aligns physical points beneath `.site-nav`, clamps them to the document range, sorts them, and deduplicates positions within four CSS pixels. When two authored declarations resolve to the same position, the higher-priority content declaration wins.

A complete full-viewport composition may explicitly align to the viewport edge instead:

```tsx
<footer data-scroll-waypoint="footer" data-scroll-align="viewport">...</footer>
```

This is reserved for compositions that need the entire viewport, including edge-anchored content such as the Footer's bottom navigation row. Navigation-edge alignment remains the default for every other physical waypoint.

## Pinned scenes

Pinned content has virtual states that cannot be represented by element `offsetTop` alone. Give its `ScrollTrigger` a stable ID:

```ts
ScrollTrigger.create({
  id: 'process-pin',
  // trigger, start, end, pin...
})
```

Declare each complete internal state with its trigger and a progress value inside the stable part of that state:

```tsx
<button
  data-scroll-virtual="process-02"
  data-scroll-trigger="process-pin"
  data-scroll-progress="0.34"
>
  Architect the system
</button>
```

The resolved vertical destination is:

```text
trigger.start + (trigger.end - trigger.start) * progress
```

For horizontal pinned tracks, mark the track and every complete scene:

```tsx
<div data-scroll-track data-scroll-trigger="systems-pin">
  <article data-scroll-track-waypoint="system-01">...</article>
</div>
```

Track progress is derived from each item's real `offsetLeft`, track width, viewport width, and leading inset. This keeps destinations correct when card sizes or gaps change.

Systems gestures move directly from one complete card waypoint to the next. No stop may sit between a card's left visual and its complete copy panel. The same rule applies to all four cards and the `Build yours.` bridge.

## Responsive scenes

Use breakpoint-specific declarations when desktop and mobile tell the story differently:

```tsx
<article
  data-scroll-waypoint-desktop="capability-01"
  data-scroll-waypoint-mobile="capability-01"
>
  ...
</article>
```

- `data-scroll-waypoint-desktop` is active above `900px`.
- `data-scroll-waypoint-mobile` is active at `900px` and below.
- `data-scroll-waypoint` is active at every width.
- Desktop virtual and horizontal-track destinations are ignored on mobile.

Mobile content must be structurally present in narrative order. Do not hide required story states behind a single tabbed panel. Process, for example, renders four physical mobile scenes even though desktop uses one pinned panel with four virtual states.

Pinned scenes must react to the `900px` media-query lifecycle—not only the initial width. Crossing the breakpoint tears down desktop pinning before the mobile layout takes over, and recreates it when returning to desktop.

When a section changes from a row to a stack, mark each complete stacked item as a mobile destination. The current inventory includes the hero report, proof metrics, four Process scenes, four System cards and bridge, six capability cards, every FAQ row, Contact, and the full Footer composition.

## Input preview and commitment

Wheel and trackpad deltas are normalized from pixel, line, and page units. The raw intent threshold is `clamp(72px, 12vh, 120px)`. The visible wheel preview target is `min(rawIntent * 0.55, adjacentDistance)`.

Single-touch gestures are classified after eight pixels of travel and only claimed when vertical travel is at least `1.25` times horizontal travel. The raw touch threshold is `clamp(56px, 10vh, 96px)`. The visible touch preview target is `min(fingerTravel * 0.72, adjacentDistance)`.

Raw intent—not the damped visual preview—determines commitment. Reaching either the input threshold or the adjacent destination's raw distance commits the gesture. Input that becomes quiet or ends below threshold returns to its origin.

The browser adapter follows the latest preview target through `requestAnimationFrame` with a time-based `55ms` exponential filter. Time-based interpolation keeps the feel consistent on 60Hz and 120Hz displays. It writes the exact target once the remaining distance is at most `0.5px`.

If a fresh wheel stream begins after the quiet boundary while another handoff is active, the director stores its direction and raw intent—not a pixel destination. Input that begins inside the final `20%` of the remaining handoff path is retained the same way, because suppressing it would make a visibly completed landing feel unresponsive. At the current landing the director resolves the adjacent authored waypoint from the settled semantic composition. The one-slot reservation can never advance more than one additional stop, regardless of delta size or repeated events inside that stream.

## Handoff motion

Every automated handoff starts from the currently rendered `window.scrollY`. Pending preview targets are cancelled and discarded before GSAP begins; an unseen queued value is never flushed into the document.

Three motion modes express different intent:

- `continue` is a committed wheel, trackpad, or touch gesture. It uses `sine.out` and `clamp(520ms, 520ms + remainingDistance * 0.32ms, 980ms)` so preview motion carries gently into a decelerating arrival.
- `return` is an insufficient wheel gesture, short touch, or claimed touch cancellation. It uses `sine.inOut` and `clamp(380ms, 340ms + remainingDistance * 1.6ms, 580ms)` for a gentle reversal.
- `direct` is a navigation link, Process tab, or geometry correction. It uses `sine.inOut` and the `520–980ms` adaptive duration for a deliberate full handoff.

The sinusoidal family is the shared velocity language for automated motion: restrained acceleration, no abrupt mid-flight change, and a soft arrival. The approved distance-adaptive duration functions remain unchanged.

Direct preview writes are never applied through a transformed virtual-scroll surface. The page always animates real `window.scrollY`. Each generated frame uses an explicit instant browser write, allowing GSAP to own the timing curve even if ScrollTrigger has restored inline smooth-scroll behavior; native smoothing must never ease an already-eased frame a second time.

Spatial motion belongs to the scroll handoff. Process state changes therefore fade their copy and visual without a second lateral or skew movement. System and Capability cards reveal individually with opacity as each card enters the viewport; a section-wide reveal must not finish while later cards are still offscreen. Reduced-motion mode renders every card immediately.

## Gesture ownership and safety

Wheel input from the active stream remains disarmed during the early and middle portions of a handoff. The quiet boundary is `180ms`, but landing turns it into a fixed rearm deadline: wheel events received after landing are buffered in the one-slot semantic queue and may not restart that deadline. This guarantees forward progress without requiring pointer movement or a click. Input retained near or after landing can advance only to the immediately adjacent composition; further momentum cannot reserve a second follow-on destination inside that handoff.

If wheel direction reverses before commitment, the reversed preview may start from the current partial position, but its quiet rollback still resolves to the gesture's original composition. A reversal must never strand the page between stops.

A new vertical touch gesture that begins during an active handoff is classified without moving the current animation. If it crosses the normal touch threshold, it reserves one adjacent semantic destination; otherwise it is discarded. If a second finger appears after a single-touch preview has been claimed, the preview returns to its origin synchronously before control returns to the browser for pinch or multi-touch behavior.

The director never claims:

- `ctrl`-wheel zoom or multi-touch/pinch gestures;
- horizontal-dominant wheel or touch movement;
- input before the page loader completes;
- an outward gesture at the top or bottom boundary;
- a gesture inside a nested `auto`/`scroll` region that can still move in that direction;
- input over a text field, textarea, select, or content-editable region;
- input while the site menu owns body scroll locking.

If a valid adjacent authored destination cannot be resolved, browser scrolling remains native.

## Accessibility exceptions

`prefers-reduced-motion: reduce` disables the narrative director completely. The browser retains native scrolling and existing reduced-motion presentation rules.

The system does not move focus, announce routine scroll changes, block pinch zoom, or apply `touch-action: none` to the page. Taps remain taps because touch default behavior is not cancelled until movement has been classified as a vertical swipe. Keyboard scrolling, focus-driven movement, browser find, and scrollbar dragging remain native.

The standalone privacy page does not mount the director.

Because the narrative director owns document position, `html.narrative-scroll-active` disables browser scroll anchoring. Dynamic content may change future geometry, but it may never move the current viewport without wheel, touch, direct navigation, keyboard, or scrollbar input. FAQ hover/open motion must therefore be layout-neutral: animate child transforms inside the fixed question grid, never padding, width, height, or line wrapping.

## Dynamic layout

Waypoint geometry is cached outside wheel and touch hot paths. It rebuilds after:

- initial mount and `document.fonts.ready`;
- the loader-complete event;
- viewport resize or orientation change;
- a GSAP `ScrollTrigger` refresh;
- a `ResizeObserver` change to the nav, main content, or footer;
- FAQ answer-height transition completion. Hover/color/transform transitions do not rebuild waypoint geometry.

Rebuild requests are coalesced into one animation frame. New sections join the movement language through authored declarations rather than controller edits. If geometry changes during an active handoff, the director re-resolves the destination by semantic waypoint ID and continues toward the refreshed coordinate. A touch that is still physically held remains blocked through its eventual `touchend` or `touchcancel`, so it cannot fight the corrected animation.

FAQ class mutations and answer-height transitions mark their rebuilds as passive content reflow. A passive rebuild refreshes future waypoint coordinates but preserves the exact current viewport. The director retains the semantic identity of the already-reached FAQ row even when that row moves around the stationary viewport, so the next gesture advances to the adjacent question rather than re-landing the shifted row. That identity must survive short previews, reversals and return animations; it clears only after a committed semantic landing or genuine native displacement. Later ordinary rebuilds may not replay the deferred coordinate correction.

Scroll-scrubbed headline reveals must finish at the same measured `.site-nav` edge used by their physical waypoint. Use a refreshable functional ScrollTrigger endpoint rather than a viewport percentage; otherwise a shorter display can land on the correct composition while leaving the headline on a fractional transform.

Responsive text and font loading may move an already-reached destination by a few pixels. Only the same last-settled semantic waypoint may be reconciled within `12px`; nearby unvisited waypoints remain eligible with only a sub-pixel directional tolerance. This prevents a small layout drift from creating a duplicate gesture without allowing a real headline one to three pixels away to be skipped. The separate authored-position deduplication rule remains `4px`.

## Tests

Any section addition, removal, breakpoint change, or pinned-state change must update tests in the same change.

- Structural component tests assert every required desktop and mobile waypoint and the eight-scene inventory.
- `NarrativeScroll.test.tsx` covers physical, virtual, track, responsive, authored-only gap, preview follower, handoff ease, and nested-scroll behavior.
- `narrativeScroll.test.ts` covers delta normalization, damping, raw commitment, one-stop clamping, mode selection, momentum absorption, one-slot follow-on wheel and touch intent, reversal, sub-threshold return, touch classification and cancellation, rebuild ownership, and nearby unvisited stops.
- `App.test.tsx` protects chapter order, director mount, and the permanent README link to this document.

A missing required scene must fail a structural test rather than silently disappearing from the journey.

## Release checklist

- Run `npm test -- --run`, `npm run lint`, `npm run build`, and `git diff --check`.
- Walk the resolved authored stop IDs in both directions; do not judge only by total scroll distance.
- Confirm Proof reaches the complete Process headline without a label-only frame.
- Confirm every chapter transition skips standalone eyebrow and running-label frames.
- Confirm each Systems gesture shows one complete destination card, followed by the bridge.
- Confirm Contact reaches the full Footer without a `JA / DATA`-only stop.
- Verify one small and one extreme wheel gesture with a mouse, plus a high-resolution trackpad flick and its momentum tail.
- Verify short rollback motion and committed handoff blending on wheel, trackpad, and touch.
- Verify short and long touch swipes at `390x844`, `375x812`, and `320x568`.
- Cross and rotate through the `900px` breakpoint and confirm the active waypoint inventory rebuilds correctly.
- Test FAQ expansion, the menu, nested scrolling, taps, horizontal movement, pinch zoom, anchors, keyboard navigation, scrollbar dragging, and Back to top.
- Hover every FAQ question and open, close, and switch answers without any unsolicited change to `window.scrollY`.
- Start a second wheel and touch gesture shortly after the first; verify it registers once after landing while continuous momentum still cannot skip.
- Keep the pointer stationary and continue wheel input through the final part of a handoff; verify the fixed rearm deadline advances to the adjacent stop without requiring a hover or click reset.
- Confirm Process states and every System and Capability card fade into their own composition without a pre-animation flash.
- Test loader completion, resize and orientation changes, and reduced-motion mode.
- Confirm there are no console errors, Vite overlays, or horizontal page overflow before release.
