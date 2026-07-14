# Website V2 Good Fella Motion Design

## Context

The current portfolio is a React 19 and Vite single-page site for Jabed Ahmed's independent data and analytics consulting practice. V2 is a complete visual and motion-system replacement based on the supplied Good Fella homepage recording and the live Good Fella website inspected on desktop and mobile.

The reference is a behavioral specification, not a source-code dependency. Reconstruct its visible loading sequence, masks, easing, pinned scroll distances, active-state changes, pointer reactions, click states, navigation behavior, section handoffs, mobile transformations, and finale as closely as practical while using Jabed's truthful content and original analytics-focused artwork.

## Goals

- Replace the rounded editorial aesthetic with a sharp, box-led, twelve-column design.
- Match the reference animation choreography as close to one-to-one as practical.
- Use one coherent orange, black, and warm-white motion language across every state.
- Replace the current Insights dashboard with an authored, scroll-driven consulting process.
- Demonstrate Jabed's systems and capabilities without inventing client case studies.
- Preserve accessibility, reduced-motion support, mobile usability, and production performance.
- Always restart at the loading screen and page top after a hard refresh.
- Finish with a verified production build running on localhost for user review.

## Selected Architecture

Keep the existing React 19, Vite, and TypeScript architecture. Add GSAP with ScrollTrigger for coordinated timelines, pinning, scroll scrubbing, masks, number reels, and state transitions. Build the interactive report and footer artwork with the Canvas 2D API.

Do not migrate to Next.js. The site remains a static, single-page portfolio, and server rendering or App Router features would not improve the animation system. Avoid a smooth-scroll replacement; use native scrolling with ScrollTrigger so anchors, keyboard scrolling, scroll restoration, and accessibility remain predictable.

## Design Tokens

- Signal orange: `#FF5A1F`
- Near-black: `#11100F`
- Warm white: `#F1F0EC`
- Muted foreground on black: `#85817E`
- Muted foreground on white: `#706D69`
- Grid and border treatments derive from the foreground colour at low opacity.
- Typography is a compact grotesk/sans family for display and body copy plus a mono face for indices, controls, metrics, and technical labels.
- Corners remain square. Pills, rounded panels, circular buttons, soft cards, and floating glass surfaces are removed.

## Global Motion Language

Every chapter uses the same three-layer reveal grammar:

1. Orange establishes direction and active state.
2. Warm white exposes or bridges content.
3. Black resolves the final composition or becomes the next section surface.

Text does not use generic opacity-only entrances. Headings, labels, navigation, CTAs, and major copy lines reveal through coloured blocks, clipping masks, character rolls, or ruled-line construction matching the reference. Section changes use staged orange, white, and black wipes rather than abrupt background changes.

Motion timings and easing should be measured against the reference recording during implementation. Preserve the visible ordering, overlap, acceleration, and settling behavior instead of substituting approximate fades.

## Hard-Refresh Loading Contract

Before the React application mounts, a small bootstrap runs from the document head:

- Set `history.scrollRestoration = 'manual'`.
- Remove an existing location hash with `history.replaceState` so a refreshed anchor does not win over the opening sequence.
- Add a root loading class and synchronously request `window.scrollTo(0, 0)`.
- Keep scrolling locked until the loader timeline completes.

The loader runs on every hard refresh:

1. Signal orange fills the viewport before the application is visible.
2. A compact `JA / DATA` glyph mark assembles at the centre.
3. A black diagonal plane cuts through the orange field.
4. The screen settles briefly on black.
5. Orange and warm-white bars reveal the navigation, hero artwork, headline, copy, CTAs, and proof metadata in the same layered order as the reference.

The target duration is approximately 3.5 seconds, subject to frame comparison with the reference. Do not replay the loader for anchor navigation, tab visibility changes, or normal in-page interactions. A reduced-motion preference preserves the loading colour states and final reveal while shortening spatial movement.

## Navigation and Menu

The fixed navigation uses a strict grid:

- Compact `JA` wordmark on the left.
- Rectangular `Menu` control at the centre or right depending on breakpoint.
- Availability cue plus split `Schedule a call / +` CTA on desktop.
- The desktop CTA is omitted from the compact mobile bar and remains available in the menu.

Opening the menu creates a full-screen black index with oversized numbered chapter links, direct email, LinkedIn, consulting availability, and the scheduling CTA. Menu text and rules enter through the same orange/white masks as the page. Escape closes the menu, focus remains trapped while open, background scrolling is locked, and focus returns to the trigger.

The navigation surface changes between black and warm-white chapters using the reference's translucent rectangular background treatment rather than a pill.

## Hero

The hero occupies at least one viewport and uses a desktop split grid. The left side retains the approved proposition:

> Data you can trust.  
> Decisions you can defend.

Supporting copy explains that Jabed designs reliable tracking, experimentation, and reporting systems for ambitious digital products. Primary and secondary actions use sharp split-button construction.

The right side contains a deliberately incomplete analytics artefact: only the final third of a fictional report is visible inside an irregular stepped silhouette. It is not a normal dashboard card. A Canvas 2D glyph field assembles into chart lines, axes, data labels, deltas, and annotations.

Interaction requirements:

- Pointer proximity repels and reforms glyphs locally.
- Horizontal pointer movement scrubs the nearest chart point and reveals fragments of its labels.
- Hover reactions remain entirely within the report; surrounding hero content does not disappear or move.
- Click cycles orange-dominant, white-dominant, and mixed palettes.
- Touch tap triggers the same palette cycle plus a short glyph pulse.
- Keyboard focus and Enter/Space expose the same interaction.
- Reduced-motion mode shows the complete report and permits palette changes without continuous movement.
- If Canvas is unavailable or initialization fails, show an accessible static SVG representation of the same cropped report.

Hero headings, copy, actions, proof metadata, and artwork assemble through the reference's orange/warm-white scan bars after the loader clears.

## Metric Strip

A hard transition introduces four square cells on warm white:

1. An orange analytics composition titled `Evidence at scale`.
2. `8+` years of experience.
3. `16` global markets.
4. `€2M+` experimentation uplift.

The three metrics use vertical digit reels like the reference, not a conventional count-up. Each reel begins before the strip fully settles and lands on its final value as the section becomes dominant. The composition collapses into a vertical stack on small screens without losing the reel entrance.

## How I Work

Remove the current Insights dashboard and replace it with a warm-white process chapter.

Desktop uses a tall section with a pinned viewport composition. An oversized `How I work.` heading introduces the chapter. The active orange square, number, title, body copy, and right-side visual advance together across four scroll states:

1. `Diagnose the decision` — annotated measurement audit identifying gaps and decisions.
2. `Architect the system` — event model connecting product behavior, consent, and destinations.
3. `Build and validate` — QA matrix assembling passing events and experiment checks.
4. `Enable and improve` — outcome brief translating trustworthy evidence into action.

Inactive rows remain visible at reduced emphasis. The orange marker travels between rows, the active number rolls vertically, text changes through clipping masks, and right-side visuals transition using the reference's cropped image handoff and easing.

On mobile, do not pin the entire process. Match the reference mobile transformation: each stage appears sequentially with its text immediately followed by a full-width visual. The same heading masks, orange markers, and active-state colour remain present.

## Systems I Build

Retain the reference's black Selected Work choreography but use it as a truthful systems showcase rather than invented client case studies.

The pinned desktop chapter is titled `Systems I build.` and contains four constructed examples:

1. Measurement architecture.
2. Experimentation readout.
3. Consent and server-side pipeline.
4. Executive decision dashboard.

A fixed left rail contains the title, concise description, four thumbnails, and orange active indicator. Large stacked artefacts move through the right side as the visitor scrolls. Clicking a thumbnail scrolls to the matching artefact. Entry uses the reference's black/orange scan transition; exit uses its warm-white bridge.

Mobile matches the reference's sequential work layout: full-width artefact, title, technical labels, then the next artefact. The desktop pinned rail is removed, while navigation remains available through the section order.

## Capabilities

The reference's `What's in a landmark` chapter becomes `What goes into reliable measurement.`

Use a sharp three-by-two ruled grid containing the six existing services:

- Tag Management
- Server-Side Tracking
- CRO and Testing
- Consent and Privacy
- BI and Data Modelling
- Front-End Instrumentation

These are continuous grid cells, not cards. Black rules construct the grid as it enters. Each capability includes a compact typographic or diagrammatic instrument. Hover and keyboard focus move a contained orange rule through the active cell without moving the rest of the layout.

## Common Questions

Use a black two-column FAQ chapter. The masked section heading occupies the left side; six ruled disclosures occupy the right:

1. What kinds of measurement problems are a good fit?
2. Can you work with our existing analytics stack?
3. Do you implement as well as advise?
4. How long does an engagement take?
5. Can you support international consent requirements?
6. What happens after launch?

Each row uses a semantic button with `aria-expanded` and `aria-controls`. Opening a row reveals its answer through clipped height and opacity, rotates the indicator, and sweeps an orange rule across the row. Closed content is hidden from assistive technology and cannot receive focus.

## Start a Project

A warm-white contact chapter follows the FAQ through orange and warm-white transition bars.

Use an asymmetric composition with:

- `Start a project.` heading.
- A concise invitation to bring the measurement problem.
- A split `Schedule a call / +` action.
- Direct email.
- Availability and `London / worldwide` metadata.
- A cropped project-brief artefact labelled `Audit / Build / Enable` in place of the reference's people photography.

The artefact, heading, copy, and actions reveal in the same order and mask style as the reference.

## Interactive Footer

The footer is a full-viewport black scene. Two fields of orange and warm-white data glyphs flow inward from opposite sides and converge into a central event stream. Pointer movement disturbs characters locally. Clicking the artwork or pressing `C` cycles orange-dominant, white-dominant, and mixed treatments.

The sparse grid contains direct email, LinkedIn, navigation, availability, a `C / change signal` hint, copyright, and a large low-contrast `Jabed Ahmed` wordmark anchored below the fold edge. Do not add a newsletter form without a real subscription destination.

Pause footer animation when it is outside the viewport or the document is hidden. Cap Canvas device-pixel ratio and glyph count to maintain performance.

## Responsive Contract

- Desktop retains pinned How I Work and Systems I Build chapters.
- Tablet preserves the desktop narrative where space permits and reduces column density.
- Mobile uses sequential chapters like the reference rather than compressed desktop pinning.
- Hero text precedes the report on mobile; the report extends below it as an irregular full-width artefact.
- Desktop navigation CTA moves into the mobile menu.
- The metric strip, capability grid, FAQ, contact chapter, and footer stack without horizontal overflow.
- Preserve all colour wipes, masks, reel entrances, palette changes, and section handoffs at every breakpoint.
- No horizontal page overflow at `1440x900`, `1280x633`, `768x1024`, `390x844`, `375x812`, or `320x568`.

## Accessibility and Failure Handling

- Preserve a keyboard-visible skip link and one semantic `main` landmark.
- Every interaction has a semantic button or link and a visible focus state.
- The hero and footer Canvas scenes have concise accessible descriptions and do not expose glyph noise.
- Menu focus is trapped and Escape closes it.
- Closed FAQ content is removed from the accessibility tree.
- `prefers-reduced-motion: reduce` disables pinning, scrubbing, continuous glyph animation, and spatial wipes while leaving all content visible.
- Canvas failures fall back to static SVG rather than a blank region.
- If JavaScript fails before animation setup, CSS progressive enhancement leaves the final content visible after the loader fallback timeout.
- Do not block page access indefinitely while waiting for fonts or decorative assets.

## Performance

- Use transform, opacity, clipping, and Canvas redraws as the primary animated operations.
- Pause requestAnimationFrame loops outside the viewport and when the tab is hidden.
- Cap Canvas device-pixel ratio and reduce glyph density on mobile.
- Preload only the fonts and critical assets required for the opening sequence.
- Avoid WebGL, autoplay video, remote logo marquees, and stock imagery.
- Keep the production bundle and animation work within a smooth experience on modern mobile hardware.

## Verification Contract

Automated and manual verification must cover:

- Hard refresh resets to the page top and begins with the loader even when refreshing an anchored or previously scrolled page.
- Loader states occur in the approved order, scrolling stays locked, and the hero reveals only after completion.
- Menu open, close, Escape, focus trap, and background lock behavior.
- Hero report hover, pointer scrub, click/tap palette cycle, keyboard operation, reduced motion, and Canvas fallback.
- Metric digit reels reach the exact final claims.
- Four process scroll states activate the correct text and visual.
- Systems showcase rail, thumbnail navigation, active marker, and mobile sequence.
- Six capability cells and focus/hover states.
- FAQ disclosure semantics and transitions.
- Contact links and scheduling destination.
- Footer pointer interaction, `C` control, pausing, and palette cycle.
- Exact screenshot checkpoints for the loader, hero assembly, each process state, each systems-showcase state, every major section wipe, FAQ, contact, and footer.
- Visual comparison against the supplied recording and live reference for timing, easing, masking, composition, and breakpoint behavior.
- No horizontal overflow at every target viewport.
- No browser-console errors, Vite overlay, trapped scroll state, invisible content, or animation left running offscreen.
- Lint and production build complete successfully.
- The final production build is served on localhost and left running for user review.

## Scope Boundaries

- Do not migrate to Next.js.
- Do not invent client names, testimonials, outcomes, or case studies.
- Do not add a backend, CMS, newsletter service, or contact-form submission endpoint.
- Do not copy Good Fella source code or photography.
- Do not commit changes unless the user later asks for a commit.
