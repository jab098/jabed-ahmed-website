# Scroll choreography

Scroll is part of the site's design language. The document remains a real, native page, but eligible wheel, trackpad, and single-touch vertical gestures are interpreted as intent to move between authored narrative compositions.

## Invariant

One physical gesture may reach only the immediately adjacent authored waypoint in its direction.

- A restrained amount of direct movement is shown first, then the site completes the handoff.
- A very large wheel delta, fast swipe, or momentum tail cannot skip a headline, card, or scene.
- Continuous input from the gesture that started a handoff is absorbed as momentum.
- After wheel input has been quiet for at least `180ms`, a new stream is a fresh gesture. A clearly separated or rebounding physical impulse may also be recognised before the old momentum tail becomes fully quiet. Either form may reserve exactly one adjacent move even if the current handoff is still finishing.
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

## Viewport-framed compositions

`data-scroll-frame="viewport"` declares that a desktop composition owns the available viewport beneath the fixed navigation:

```tsx
<section data-scroll-frame="viewport" data-scroll-waypoint="proof">...</section>
```

Above `900px`, the shared frame rule supplies `min-height: calc(100svh - var(--nav-height))`. It is a layout contract, not a waypoint: the element still needs an authored physical declaration, and content may grow beyond the minimum when it genuinely needs more room. At `900px` and below, content returns to its natural stacked height and its mobile waypoints define the story.

Proof and FAQ are the current viewport-framed chapters. Their desktop landings must read as isolated, complete compositions without a strip of the following section showing. FAQ owns `faq-heading` at the section boundary so its sticky heading and question list arrive as one frame; Proof uses one stretching grid row so all evidence tiles share the available height. Short desktop viewports at or below `760px` compact FAQ padding, row height and type scale so all six closed questions remain inside the authored frame; opening an answer may then grow the section naturally.

## Gesture epochs

A wheel gesture epoch begins with the first eligible pixel-, line-, or page-mode event after verified quiet, or with a measured fresh physical impulse that can be distinguished from the decaying tail. That epoch owns one landing token.

- Committing consumes the token for the immediately adjacent authored waypoint.
- Every later event in the same continuous stream is absorbed through the final approach and after landing. Each event moves the `180ms` quiet boundary; animation progress or proximity to the landing never promotes it into another gesture.
- The fresh-impulse classifier applies only to pixel-mode input, where the event stream exposes useful timing and magnitude shape. A pause of at least `72ms` starts a new impulse. A shorter pause of at least `24ms` may also start one only after the prior stream has decayed below `55%` of its peak and the new event rebounds to at least `1.8x` the previous magnitude, `32%` of that peak and `8px`. A meaningful reverse impulse follows the same minimum pause and magnitude floor. Line- and page-mode streams still require actual `180ms` quiet, so a long or spaced mouse-wheel roll cannot gain another landing token.
- Once the quiet callback has actually fired, the next eligible event begins a fresh epoch without needing impulse classification. If the current handoff is still active, either kind of fresh epoch may occupy the one-slot semantic queue.
- The queue stores direction and accumulated raw intent, never a pixel coordinate. It resolves one adjacent waypoint from the semantic landing, so repeated events within the queued epoch cannot reserve a second follow-on destination.
- Changing delta mode or sending an extreme delta does not create another token. A dense line-mode burst and a long pixel stream still produce one landing.

Touch does not share wheel-session timing. A new single-touch gesture is classified independently and, when it commits during an active handoff, may reserve one adjacent semantic destination.

## Input preview and commitment

Wheel and trackpad deltas are normalized from pixel, line, and page units. The raw intent threshold is `clamp(72px, 12vh, 120px)`. The visible wheel preview target is `min(rawIntent * 0.55, adjacentDistance)`.

Single-touch gestures are classified after eight pixels of travel and only claimed when vertical travel is at least `1.25` times horizontal travel. The raw touch threshold is `clamp(56px, 10vh, 96px)`. The visible touch preview target is `min(fingerTravel * 0.72, adjacentDistance)`.

Raw intent—not the damped visual preview—determines commitment. Reaching either the input threshold or the adjacent destination's raw distance commits the gesture. Input that becomes quiet or ends below threshold returns to its origin.

The browser adapter follows the latest preview target through `requestAnimationFrame` with a time-based `55ms` exponential filter. Time-based interpolation keeps the feel consistent on 60Hz and 120Hz displays. It writes the exact target once the remaining distance is at most `0.5px`.

## Handoff motion

Every automated handoff starts from the currently rendered `window.scrollY`. Pending preview targets are cancelled and discarded before GSAP begins; an unseen queued value is never flushed into the document.

Three motion modes express different intent:

- `continue` is a committed wheel, trackpad, or touch gesture. It uses `sine.out` and `clamp(520ms, 520ms + remainingDistance * 0.32ms, 980ms)` so preview motion carries gently into a decelerating arrival.
- `return` is an insufficient wheel gesture, short touch, or claimed touch cancellation. It uses `sine.inOut` and `clamp(380ms, 340ms + remainingDistance * 1.6ms, 580ms)` for a gentle reversal.
- `direct` is a navigation link, Process tab, or geometry correction. It uses `sine.inOut` and the `520–980ms` adaptive duration for a deliberate full handoff.

The sinusoidal family is the shared velocity language for automated motion: restrained acceleration, no abrupt mid-flight change, and a soft arrival. The approved distance-adaptive duration functions remain unchanged.

Direct preview writes are never applied through a transformed virtual-scroll surface. The page always animates real `window.scrollY`. Each generated frame uses an explicit instant browser write, allowing GSAP to own the timing curve even if ScrollTrigger has restored inline smooth-scroll behavior; native smoothing must never ease an already-eased frame a second time.

## Component motion

Spatial motion belongs to the scroll handoff. Local component motion supports the composition without competing with it:

- Proof metrics keep their clipped rise and count once when Proof first intersects. Numeric text follows `1 - (1 - progress)^3` for `2400ms`, preserves prefixes, suffixes and configured decimals, and writes the exact source string at completion. The visible digits use tabular numerals; the metric article keeps the final value in its accessible label. There are no digit reels.
- Process retains the previous and current copy/visual layers for a symmetric `480ms` opacity crossfade. Cleanup timers are cancelled when another state wins, preventing stale layers from deleting the current state. The transition adds no translation, skew, or blur.
- System and Capability cards reveal individually with opacity as each card enters the viewport; a section-wide reveal must not finish while later cards are still offscreen.
- Reduced motion shows final metric values immediately, completes Process layer transitions in `1ms`, renders cards and masked headlines in their final state, and leaves document scrolling native because the narrative director is not mounted.

## Gesture ownership and safety

Wheel input from the active epoch remains disarmed until the stream has been quiet for `180ms` or the timestamp-and-magnitude classifier identifies a fresh physical impulse. Accepted tail events reset the quiet deadline even when the visual handoff is nearly complete or has already landed, so a long physical stream cannot become a second landing by crossing an animation-position threshold. A fresh epoch may queue one adjacent semantic move while the current handoff finishes, or begin that move immediately when the previous landing has completed. Rearming depends only on wheel input evidence—never pointer movement, hover, or a click.

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

`prefers-reduced-motion: reduce` disables the narrative director completely. The browser retains native scrolling and the final-state component rules recorded above.

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

Scroll-scrubbed headline reveals must finish at the same measured `.site-nav` edge used by their physical waypoint. Process, Systems, and Contact share exact `scrub: true` motion and clear their inline line transforms when ScrollTrigger progress reaches `0.999`. Their masks use `overflow: hidden` with paint containment. Keep that shared settling contract, the refreshable functional endpoint, and both mask safeguards together; otherwise a landing can leave a fractional transform or a clipped antialias fragment, especially on large Safari displays.

Responsive text and font loading may move an already-reached destination by a few pixels. Only the same last-settled semantic waypoint may be reconciled within `12px`; nearby unvisited waypoints remain eligible with only a sub-pixel directional tolerance. This prevents a small layout drift from creating a duplicate gesture without allowing a real headline one to three pixels away to be skipped. The separate authored-position deduplication rule remains `4px`.

## Known failure modes and safeguards

| Failure mode | Safeguard |
| --- | --- |
| A momentum tail or dense line-wheel burst advances twice. | One epoch owns one landing token; all events remain absorbed until verified quiet, with no animation-position promotion. |
| A fresh gesture resolves from an obsolete preview coordinate. | Pending preview writes are cancelled before handoff, and the one-slot queue stores semantic direction and intent rather than pixels. |
| Proof or FAQ reveals part of the next chapter on an awkward desktop height. | `data-scroll-frame="viewport"` supplies a nav-adjusted desktop minimum while the authored section waypoint owns the full composition. |
| A masked orange headline leaves fragments after landing in Safari. | Exact shared scrub, `0.999` transform cleanup, `overflow: hidden`, and `contain: paint` settle all three headline scenes. |
| A Process state flashes, slides, or is removed by an old timer. | Stable previous/current layers crossfade with opacity only; effect cleanup cancels stale `480ms` timers. |
| Proof digits replay, reel, or stop short of the source value. | The observer disconnects after first visibility, the counter writes the exact final string, and reduced motion bypasses counting. |
| FAQ hover or expansion moves a stationary viewport or re-lands the same row. | Hover transforms are layout-neutral; passive rebuilds preserve `window.scrollY` and the last settled semantic identity. |
| A breakpoint change leaves desktop pins or destinations active on mobile. | The `900px` media-query lifecycle tears down and rebuilds pinning and the active waypoint inventory. |

## Tests

Any section addition, removal, breakpoint change, or pinned-state change must update tests in the same change.

- Structural component tests assert every required desktop and mobile waypoint and the eight-scene inventory.
- `NarrativeScroll.test.tsx` covers physical, virtual, track, responsive, authored-only gap, preview follower, handoff ease, and nested-scroll behavior.
- `narrativeScroll.test.ts` covers delta normalization, damping, raw commitment, one-stop clamping, mode selection, momentum absorption, one-slot follow-on wheel and touch intent, reversal, sub-threshold return, touch classification and cancellation, rebuild ownership, and nearby unvisited stops.
- `App.test.tsx` protects chapter order, director mount, and the permanent README link to this document.

A missing required scene must fail a structural test rather than silently disappearing from the journey.

## Release checklist

- Run `npm test -- --run`, `npm run lint`, `npm run build`, and `git diff --check`.
- Run the viewport matrix in both current Chrome and Safari:

  | Viewport | Required observation |
  | --- | --- |
  | `1440x900` | Standard desktop chapter framing, complete card/state landings, and exact masked headlines. |
  | `1499x886` | Awkward desktop height: no clipped copy, partial following surface, or duplicate stop. |
  | `2554x1425` | Large-display Safari regression: no orange headline fragments after Process, Systems, or Contact settles. |
  | `1455x1279` | Tall desktop frame: Proof and FAQ remain isolated and Process content stays balanced. |
  | `390x844` | Wide mobile: short/long touch classification and the complete stacked waypoint inventory. |
  | `375x812` | Baseline mobile: touch rollback/commit, FAQ open/close, Contact, and Footer. |
  | `320x568` | Small mobile: no overflow, hidden required copy, or unreachable authored state. |

- Walk the resolved authored stop IDs in both directions; do not judge only by total scroll distance.
- Confirm Proof reaches the complete Process headline without a label-only frame.
- Confirm every chapter transition skips standalone eyebrow and running-label frames.
- Confirm each Systems gesture shows one complete destination card, followed by the bridge.
- Confirm Contact reaches the full Footer without a `JA / DATA`-only stop.
- Verify one small and one extreme wheel gesture with a mouse, plus a high-resolution trackpad flick and its momentum tail.
- Hold one long pixel stream through the final approach and landing; it must stop at exactly one adjacent composition.
- Send a dense line-mode burst through the same interval; it must also spend exactly one landing token.
- After at least `180ms` of verified quiet, start a quick fresh second gesture while the first handoff is still finishing; it may queue exactly one adjacent landing.
- Verify short rollback motion and committed handoff blending on wheel, trackpad, and touch.
- Verify short and long touch swipes at `390x844`, `375x812`, and `320x568`.
- Cross and rotate through the `900px` breakpoint and confirm the active waypoint inventory rebuilds correctly.
- Test FAQ expansion, the menu, nested scrolling, taps, horizontal movement, pinch zoom, anchors, keyboard navigation, scrollbar dragging, and Back to top.
- Hover every FAQ question and open, close, and switch answers without any unsolicited change to `window.scrollY`.
- Start a second committed touch gesture during a handoff; verify it registers once after landing while a short second swipe reserves nothing.
- Keep the pointer stationary and continue the same wheel stream through and after landing; verify it remains on that landing until a real quiet boundary, with no hover or click reset involved.
- Confirm Process states and every System and Capability card fade into their own composition without a pre-animation flash.
- Confirm all three Proof metrics count once to their exact strings, Process transitions keep only the current and previous layers, and reduced motion shows every final state immediately.
- Leave the pointer stationary at the end of Process, Systems, and Contact headline reveals; inspect at normal scale and zoom for fractional transforms or retained orange mask fragments.
- Test loader completion, resize and orientation changes, and reduced-motion mode.
- Confirm there are no console errors, Vite overlays, or horizontal page overflow before release.
