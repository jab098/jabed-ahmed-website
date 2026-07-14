# Motion Density and Method Refinement Design

## Goal

Refine the V2 site so its menu, scroll accents, hero reveal and interactive hero report feel deliberate and reference-grade, while making the final method visual communicate an actionable decision rather than an unexplained chart.

## Constraints

- Preserve the existing ink, paper and `#ff5a1f` signal-orange colour language.
- Keep the current React, GSAP, Canvas and SVG stack; add no rendering dependency.
- Preserve keyboard interaction, reduced-motion fallbacks and the click-to-cycle hero palette.
- Preserve every previous clipping correction, including metric and large-heading fixes.
- Do not commit.
- Leave the production build available at `http://localhost:4173/`.

## Design

### Menu motion

The full-screen menu wipe remains the primary transition. Header, footer and individual link rows begin transparent and slightly displaced. They fade and settle in after the ink wipe reaches them, using short staggered delays. Closing reverses the opacity and displacement before the menu becomes hidden, so text never pops on or off.

### Final method state

Replace the six unlabelled bars in “Ship the winning system” with a compact decision-release dashboard. The panel will show:

- a winning variant versus control comparison;
- the measured lift and confidence;
- a clear rollout state;
- two guardrail checks;
- an evidence → decision → owner handoff strip.

The headline remains the dominant message. Supporting information uses the mono micro-label system already established across the site, with restrained staged reveals on entry.

### Scroll flashes

Both `yours.` and `your` use the exact theme signal orange. Their colour ramps complete over a short scroll interval so the dim intermediate orange is barely visible. `Build yours.` begins changing before it reaches the viewport edge and reaches full orange just after entering. The contact word flashes to full orange earlier in the section, holds briefly, then returns to ink over a similarly tight range.

### Tab icon

Retain the orange square and JA identity, but replace the near-edge solid letterforms with inset thin-stroke custom paths. The mark gains more breathing room at every browser-tab size and no longer reads as an oversized block.

### Hero headline and entrance

Give every reveal line a dedicated ink-safe inset around the text and remove the temporary text clip after the wipe completes. This protects the final `s`, the `y` descender and earlier corrected glyphs without changing the established left-to-right two-colour reveal. The orange hero panel starts fully transparent and fades in while its horizontal mask opens, preventing a hard orange frame immediately after the loader.

### Interactive hero report

Keep the chart recognisable, but bring its behaviour closer to the supplied recording:

- reduce glyph size and spacing;
- retain roughly one third of ambient grid points instead of one eighth, producing around four times the current field density;
- assign each point a depth value for subtle whole-composition parallax;
- keep local cursor repulsion, with a larger soft radius and spring return;
- slowly mutate glyph values near the cursor rather than swapping the entire field at once;
- blend points near the cursor toward paper/orange, creating a smooth theme-colour halo;
- move the SVG chart skeleton on a shallower parallax layer;
- reset all offsets smoothly on pointer exit;
- preserve the gradual click palette transition.

Canvas remains the dense rendering layer; SVG remains the semantic chart skeleton. Reduced motion disables parallax, repulsion and mutation while leaving the static chart readable.

## Verification

- Structural tests cover menu motion hooks, the expanded method dashboard, tightened flash metadata, the thin-stroke favicon, safe hero reveal hooks and the denser interactive report contract.
- Run focused red/green tests before the full suite.
- Run lint, all tests, build and `git diff --check`.
- Visually inspect loading-to-hero, menu open/close, both flashes, the final process state and hero pointer behaviour at desktop and mobile widths.
- Confirm zero horizontal overflow, no console errors and no loader or navigation flash.
