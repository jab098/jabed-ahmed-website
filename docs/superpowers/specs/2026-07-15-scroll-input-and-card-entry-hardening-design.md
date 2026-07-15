# Scroll input and card entry hardening

## Problem

Three timing and layout defects break the site's authored scroll language:

1. FAQ hover currently animates horizontal padding. That changes layout and can rewrap a question. FAQ expansion also changes document height while browser scroll anchoring is active, so the viewport can move without a wheel or touch gesture.
2. The gesture director absorbs every wheel event during an automated handoff. Even after the original stream has been quiet for `180ms`, a deliberate second gesture is discarded and can keep resetting the quiet timer. The user then has to wait or spam-scroll after landing.
3. Process states use a directional/skew entrance, while System and Capability cards become visible before their own authored composition enters. The result reads as a flash followed by an animation rather than a clean arrival.

## Interaction contract

The existing one-gesture/one-adjacent-waypoint invariant remains authoritative. Continuous wheel momentum during a handoff is absorbed. Once wheel input has been quiet for `180ms`, the next wheel stream is a distinct gesture and may reserve exactly one adjacent destination. A large reserved gesture commits; a small one remains sub-threshold and must not create a skip.

A new single-touch swipe that starts during a handoff is also a distinct physical gesture. A committed swipe reserves one adjacent destination and runs after the current landing; a short swipe does nothing. At most one follow-on destination may be reserved at a time.

The queue is semantic rather than geometric: after the current animation lands, the director resolves the next authored waypoint from that settled destination. It never carries an arbitrary pixel target across a layout rebuild.

## FAQ stability

Hover and open-state motion must be layout-neutral. Question text and controls may translate inside the stable button grid, but padding, width, height, and line wrapping do not animate. Because the narrative director owns document position, browser scroll anchoring is disabled while the director is active. Accordion height changes may rebuild future waypoint geometry but may not alter `window.scrollY` on their own.

## Card entrances

Process visual state changes use a simple opacity fade with no skew or lateral displacement. Capability and System cards reveal individually when they intersect the viewport instead of inheriting an early section-wide reveal. Their entry is opacity-only, so the authored scroll handoff remains the sole spatial motion. Reduced-motion mode renders every card immediately.

## Verification

- A second large wheel gesture after a `180ms` quiet gap but before the current handoff completes advances exactly one additional waypoint.
- Momentum without that quiet gap never advances again.
- Repeated queued events still reserve only one waypoint.
- A second committed touch swipe during a handoff advances once; a short one does not.
- Hovering every FAQ question leaves its box geometry and `window.scrollY` unchanged. Opening, closing, and switching answers leaves `window.scrollY` unchanged.
- Process, Systems, and Capability entries begin transparent and fade normally into their own composition.
- Desktop and mobile browser passes retain every authored stop and produce no console errors or horizontal overflow.
