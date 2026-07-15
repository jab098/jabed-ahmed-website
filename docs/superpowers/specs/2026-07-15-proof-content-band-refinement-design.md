# Proof content-band refinement

## Approved direction

Keep Proof as the same four-column desktop viewport frame and retain its single section-level `proof` waypoint. Replace the bottom-aligned tile content with one shared horizontal content band: the headline block and all three metric blocks are vertically centred on a line positioned `60%` down the usable Proof frame.

The full-height orange and paper tiles, borders, metric count-up, grid artwork, labels and mobile card stops remain unchanged. Because the outer frame height and waypoint stay unchanged, Process and its `// How I work` label cannot enter the Proof landing.

At `900px` and below, the approved stacked layout keeps its existing bottom alignment and per-card waypoints. The content-band positioning is desktop-only.

Between `901px` and `1200px`, cap the metric type with `clamp(3.1rem, 5.8vw, 6rem)` so the longer decimal values shown during count-up remain inside their quarter-width tiles. Larger desktop and stacked mobile type scales remain unchanged.

## Structure

Wrap the Proof heading and each metric value/label in dedicated content containers. All four wrappers share a stable `data-proof-content-band` hook. Desktop CSS positions those wrappers absolutely at `top: 60%` and centres each block around that line with `translateY(-50%)`; the wrappers remain normal flex children on tablet and mobile.

## Verification

- A structural component test must find exactly four content-band wrappers while preserving the viewport frame and waypoint declarations.
- A CSS contract test must confirm the `60%` desktop band and centred transform.
- The compact-desktop count-up state must not overflow its metric tile.
- The existing metric count-up, reduced-motion, narrative-scroll and viewport-framing tests must remain green.
- Lint and the production build must pass before localhost is started.
