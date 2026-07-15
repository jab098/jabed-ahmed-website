# Authored Scroll Stops and Blended Handoffs Design

## Context

The first narrative-scroll release added generated continuation waypoints whenever two resolved destinations were more than `82vh` apart. Live review showed that these technically safe filler stops do not correspond to designed compositions:

- between Proof and Process they can stop with only `// How I work` and part of the next headline visible;
- between Process states they can expose `// The method` without the complete state;
- inside the pinned Systems track they can stop between cards, showing one card's asset beside only part of the next card;
- before the Footer they can stop at the small `JA / DATA` label before the full footer composition.

The screenshots supplied on 2026-07-15 establish the desired contrast: the partial label/card frames are invalid destinations, while the complete Process headline and complete Experimentation card are valid destinations.

This design supersedes the continuation-waypoint and one-to-one preview portions of `2026-07-15-narrative-scroll-choreography-design.md`. The one-gesture/one-adjacent-authored-destination invariant remains unchanged.

## Goal

Make narrative scrolling land only on intentional compositions and blend manual intent into automated motion without a visible change of ownership.

Success means:

- no section eyebrow, small label, card asset, or arbitrary empty interval becomes a stop;
- every full section headline, Process state, System card, bridge, capability, FAQ scene, Contact composition, and full Footer remains reachable;
- a large gesture still advances no more than one adjacent authored destination;
- forward takeover continues from the rendered movement without a pause or snap;
- a sub-threshold gesture returns gently to its origin;
- wheel, trackpad, and touch share the same authored stop map and motion language;
- reduced-motion and native-browser exceptions remain unchanged.

## Approaches Considered

### 1. Authored-only destinations with blended preview and mode-specific easing — selected

Remove generated continuations entirely. Keep explicit DOM, pinned-progress, and horizontal-card declarations as the complete destination map. Dampen and smooth the preview movement, then use separate forward and return handoff profiles.

This is the simplest durable rule: contributors opt a composition into the journey; geometry alone never invents one.

### 2. Per-section continuation opt-outs

Keep the `82vh` generator and annotate Process, Systems, Footer, and similar chapters to suppress it. This would preserve filler stops elsewhere, but every new layout and breakpoint could recreate the same problem. The rules would describe exceptions instead of the intended design language.

### 3. Root CSS scroll snap

CSS snap could hide some intermediate frames, but it cannot model the virtual states inside GSAP-pinned Process and Systems scenes or guarantee one-stop momentum behavior consistently. It would also compete with the current gesture director.

## Destination Model

`buildWaypointMap` will only:

1. discard non-finite positions;
2. clamp positions to the document range;
3. sort by position and priority;
4. deduplicate positions within four CSS pixels, preferring authored content.

It will never create `--continuation-*` destinations.

`data-scroll-scene` remains the semantic chapter declaration and structural inventory marker, but it no longer causes filler generation. A scene boundary is not itself a destination.

### Valid authored destinations

- Hero composition.
- Proof composition.
- Complete Process headline, followed by Process states 01–04.
- Complete Systems headline, Systems cards 01–04, and `Build yours.` bridge.
- Complete Capabilities headline and the breakpoint-appropriate capability cards/rows.
- Complete FAQ headline and the breakpoint-appropriate FAQ scenes.
- Contact composition.
- Full Footer composition.

The Footer waypoint remains because the complete footer is an authored closing composition. What disappears is the generated approach stop that showed only the small `JA / DATA` label.

Section eyebrows such as `// How I work`, `// The method`, `// Working systems`, and `// Inside the system` are never independent destinations. They remain visible as part of their containing full composition.

### Pinned Systems rule

Each `data-scroll-track-waypoint` resolves directly from the corresponding card's horizontal offset. Moving forward from `system-01` targets `system-02`; no geometry-derived position may exist between them. The stable stop must present the complete destination card, matching the supplied fourth screenshot rather than the split frame in the third screenshot. The same rule applies to every Systems card and the closing bridge.

## Input Preview

Intent thresholds remain unchanged:

- wheel/trackpad: `clamp(72px, 12vh, 120px)`;
- touch: `clamp(56px, 10vh, 96px)`.

Raw input continues to determine commitment, but it no longer maps one-to-one to visible page travel.

- Wheel preview target: `min(rawIntent * 0.55, adjacentDistance)`.
- Touch preview target: `min(fingerTravel * 0.72, adjacentDistance)`.

The smaller preview communicates direction while reducing the visible signature of coarse wheels and noisy trackpads. Touch remains more responsive than wheel without exposing the full finger delta before takeover.

The adapter follows the latest preview target with a time-based requestAnimationFrame filter using a `55ms` time constant. Time-based interpolation keeps the feel consistent on 60Hz and 120Hz displays. Preview writes stop within half a CSS pixel of the target.

## Handoff Profiles

Every animation starts from the currently rendered `window.scrollY`.

When a gesture commits, any pending preview target is cancelled without being flushed or snapped into the document. GSAP therefore inherits the position the visitor actually saw in the previous frame.

### Forward handoff

- Mode: `continue`.
- Ease: `power1.out`.
- Duration: existing adaptive `clamp(520ms, 520ms + remainingDistance * 0.32ms, 980ms)`.

The non-zero starting velocity blends into the directional preview, while the ease decelerates into the authored composition.

### Insufficient-input return

- Mode: `return`.
- Ease: `sine.inOut`.
- Duration: `clamp(380ms, 340ms + remainingDistance * 1.6ms, 580ms)`.

The symmetric ease reverses gently and avoids making a short unsuccessful gesture feel like a mechanical snap-back.

### Direct navigation and geometry reconciliation

- Mode: `direct`.
- Ease: `power3.inOut`.
- Duration: the existing adaptive duration.

Site links, Process tabs, and geometry corrections retain a deliberate full handoff. They do not use the gesture preview.

## Gesture State and Safety

Removing continuations does not relax traversal safety:

- one physical gesture still selects only the immediately adjacent authored waypoint;
- an extreme delta cannot cross two authored destinations;
- momentum remains disarmed until a real `180ms` quiet period;
- direction reversal before commitment returns toward the original authored composition without crossing it;
- input during an active handoff is absorbed rather than queued;
- touch rebuild, multi-touch rollback, nested-scroll, form-control, menu-lock, and boundary protections remain intact;
- missing destinations leave the browser native rather than inventing a fallback stop.

## Responsive Behavior

Desktop and mobile keep their existing authored inventories. Mobile Process and Systems items remain physical sequential scenes; desktop Process and Systems remain virtual pinned states. No generated stop is added at either breakpoint, so stacked mobile labels and desktop pinned artwork cannot become accidental destinations.

The smoothed preview and mode-specific handoffs apply equally to wheel, trackpad, and claimed single-touch gestures. `prefers-reduced-motion: reduce` continues to disable the director completely.

## Documentation Changes

`docs/design-language/scroll-choreography.md` must be updated so future sections follow these rules:

- authors declare complete compositions only;
- `data-scroll-scene` marks chapter ownership but never generates stops;
- arbitrary maximum-gap or continuation rules are forbidden;
- section labels and decorative assets are not destinations;
- forward, return, direct, and reduced-motion behavior are documented separately;
- release checks walk the authored stop IDs rather than judging only scroll distance.

The README link remains unchanged.

## Testing Contract

### Automated behavior

- A large gap inside a declared scene produces exactly the authored waypoint IDs and no continuation IDs.
- A large wheel delta still selects only the next authored destination.
- Wheel preview travel is damped to `55%` while commitment uses raw intent.
- Touch preview travel is damped to `72%` while commitment uses raw finger travel.
- Forward commitment requests `continue` mode.
- Wheel and touch rollback request `return` mode.
- Direct navigation requests `direct` mode.
- Momentum, reversal, rebuild, multi-touch, nearby-stop, and nested-scroll regressions remain green.
- Footer stays in the authored structural inventory without a generated approach stop.

### Real-browser verification

- Proof must move directly to the complete Process headline, never the label-only frame in screenshot 1.
- Every chapter transition must skip label-only compositions while retaining the full headline.
- Each Systems gesture must move from one complete card to the next, matching screenshot 4 and never screenshot 3.
- Contact must move to the complete Footer without a `JA / DATA`-only stop.
- Short wheel and touch input must visibly ease back rather than snap.
- Committed wheel/trackpad input must blend into the automated handoff without flushing a pending manual preview.
- Recheck desktop, `390x844`, `375x812`, and `320x568`; rotate across the `900px` breakpoint; verify no overflow, overlay, or console errors.

## Scope Boundaries

- Do not change typography, layout, content, colour, or card dimensions.
- Do not remove full headline, card, bridge, Contact, or Footer destinations.
- Do not add a smooth-scroll dependency or transform the page into a virtual scroller.
- Do not change commitment thresholds, the one-gesture adjacency rule, or accessibility exceptions.
- Do not intercept keyboard scrolling, scrollbar dragging, browser find, focus movement, pinch zoom, or reduced-motion users.
