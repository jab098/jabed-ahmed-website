# Footer, motion, and headline polish design

## Goal

Refine the authored narrative-scroll language without changing its approved stop cadence or timing:

- the Footer stop must show the complete Footer composition, including its bottom navigation row;
- automated travel must feel fluid and professional while preserving the current duration model;
- headline reveals must be fully settled and crisply rendered at their authored stop on every viewport height.

## Footer alignment

Physical waypoints normally align immediately below the fixed navigation. The Footer is a deliberate full-viewport exception: it opts into `data-scroll-align="viewport"`, so its top edge aligns with the viewport rather than the navigation bottom.

Alignment remains declarative and reusable. The waypoint collector reads the alignment attribute from any physical waypoint, while all existing waypoints keep navigation-edge alignment by default. The final value remains clamped to the document's maximum scroll position.

## Automated motion

Keep the approved distance-based duration functions unchanged. Replace the current mixed power eases with a coherent sinusoidal velocity profile:

- continuation uses `sine.out`, preserving the gesture's initial momentum and decelerating gently into the destination;
- return uses `sine.inOut`, producing a controlled reversal with no abrupt velocity change;
- direct navigation uses `sine.inOut`, giving long authored moves a restrained acceleration and deceleration.

The same easing contract applies to wheel, trackpad, touch, and direct-link handoffs because all routes use the shared adapter.

## Headline settling

The Process, Systems, and Contact headings use scroll-scrubbed transforms. Their previous percentage-based end positions did not necessarily coincide with the authored waypoint on shorter displays, leaving fractional or incomplete transforms when scrolling stopped.

Each reveal now ends at the measured bottom edge of `.site-nav`, matching the physical waypoint collector. The endpoint is recalculated during ScrollTrigger refresh so responsive navigation heights and viewport changes remain correct. This changes neither the headline layout nor the stop location; it only guarantees the revealed text is fully settled when the composition lands.

## Verification

- Unit-test default navigation alignment and the explicit viewport-alignment exception.
- Unit-test the three shared easing selections without changing duration assertions.
- Unit-test the navigation-edge reveal endpoint helper and Footer markup contract.
- Build and lint the project.
- Verify desktop Retina, shorter desktop, tablet/mobile, Footer composition, stop-by-stop headline transforms, large wheel input, touch input, and reduced-motion behavior in a real browser.
