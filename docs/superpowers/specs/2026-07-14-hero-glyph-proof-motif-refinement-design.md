# Hero Glyph, Proof Metric and Motif Refinement Design

## Scope

Refine three existing V2 elements without changing the overall page structure, palette or executive dashboard.

## Hero asset

The right-hand hero asset becomes entirely graphical. Remove every human-readable SVG label, metric, legend, tick, bottom caption and hover readout. Preserve the small canvas glyphs because they are visual texture rather than content. Replace both conventional trend strokes with at least 24 independent geometric signal pieces arranged as a visibly rising contour. Keep the faint grid, bars, glyph assembly, probe crosshair and smooth palette interaction.

## Proof metrics

Render all three proof values as single static value groups with a clipped upward reveal rather than stacked digit reels. This avoids exposing adjacent digits and removes the width compression caused by negative spacing between reel boxes while preserving the section's reveal motion.

## Capability motif

Give every motif an explicit number hook. Remove the triangular clip from the whole third motif so `03` shares the same oversized, hover-animated background layer as the other five cards. Preserve the third card's angled visual character through its grid transformation rather than clipping its numeral.

## Verification

Add structural regression tests first, then verify at the supplied desktop viewport and a mobile viewport. Required checks: no visual text in the hero asset, at least 24 independent signal pieces, no reel boxes in the proof strip, visible `03` motif hook, zero overflow and no browser errors.
