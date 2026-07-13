# Precision Editorial Optimisation

## Context

The current site has a strong, coherent foundation: a warm material hero, an editorial profile manifesto, an immersive dark decision room, and a ruled capability index. The next pass should not replace those concepts. It should remove the details that make the experience feel less resolved on touch devices, compact phones, keyboard navigation, and the transitions between chapters.

The audit found five concrete weaknesses:

- The fixed navigation has no active-section state, no page-progress cue, and a basic mobile dropdown that does not match the quality of the page.
- At `320×568`, the hero grows well beyond the viewport and leaves the secondary action below the first screen.
- The decision-window reveal waits until half of a large panel is visible, so the first view of Insights can look like an empty black frame.
- Closed AI-method and capability details remain readable in the accessibility snapshot even though they are visually collapsed.
- The twenty-logo marquee depends on twenty remote SVG requests and visually returns to a familiar SaaS-logo-strip pattern.

## Approaches Considered

### 1. Precision editorial refinement — selected

Keep the existing chapter concepts and improve hierarchy, motion timing, navigation, touch interaction, accessibility, and the ending. This preserves the design the user already loves while making the whole experience feel more authored and reliable.

### 2. Full second redesign

Replace the existing chapters with scrollytelling, parallax scenes, and new visual metaphors. This could create novelty, but it would discard strong approved work, increase motion and implementation risk, and weaken the immediate consulting proposition.

### 3. Micro-polish only

Adjust spacing, colour, and font sizes without changing structure or interaction. This is low-risk, but it would leave the empty Insights reveal, compact-phone hero, generic mobile menu, accessibility-tree leakage, and remote-logo payload unresolved.

## Selected Direction

The site becomes a **precision editorial system**: large expressive typography is balanced by small, useful metadata; motion explains state rather than decorating every surface; and each breakpoint gets a composition designed for its available space.

### Global frame and navigation

- Add a skip link and a semantic `main` landmark.
- Add `scroll-margin-top` and reduced-motion-safe anchor behaviour.
- Keep the wordmark, centred desktop navigation, and auto-hide behaviour.
- Add an active-section indicator with `aria-current="page"` and a thin reading-progress line.
- Add a quiet desktop consulting cue on the right: `Independent consulting` plus `Book an intro`.
- Replace the mobile dropdown with a full-width editorial menu panel containing numbered navigation, the independent-consulting descriptor, email, and call action.
- The menu closes on link selection and Escape, locks body scroll while open, and keeps the navigation visible.

### Hero refinement

- Preserve the exact headline, supporting copy, palette, texture, proof points, and two actions.
- Add a concise mobile CTA label so both actions remain on one line where possible.
- For compact phones below `420px` wide and `680px` tall, reduce heading and spacing, keep the essential call action above the fold, and hide the duplicated proof strip.
- Increase the contrast of small proof metadata and keep all primary touch targets at least `44px` high.

### Profile chapter

- Preserve `I make complex products measurable.` and the material ring composition.
- Recompose the identity metadata into two clean pieces instead of a slash that wraps awkwardly on mobile.
- Turn the practice rail into four numbered ruled disciplines: Collect, Govern, Experiment, Explain.
- Refine the proof ledger labels so each number states its relevance, while using only claims already present in the site.
- On mobile, tighten the opening space and improve small-label contrast without reducing the editorial scale.

### Decision room

- Preserve the headline, proof points, dark room, desktop dashboard interactions, and AI-search chapter.
- Trigger the decision-window reveal when roughly `12%` is visible and shorten the boot delay so the embedded work never reads as an empty frame.
- Replace the mobile copy of the full desktop chart with a purpose-built executive snapshot: one clear visibility outcome, a small trend chart, and three ranked platforms.
- Expose a concise screen-reader summary for the decorative mobile snapshot.
- Keep query motion visual-only in the accessibility tree and provide one readable summary of the example query themes.
- Closed methodology notes use visibility and inert-state semantics so they are not exposed while collapsed.

### Capability chapter

- Preserve the split layout, sticky desktop introduction, six ruled rows, and one-active-row model.
- Use visibility and inert-state semantics for inactive details.
- Refine focus treatment so keyboard state is obvious without looking like an extra rounded card.
- Replace the remote image marquee with a typographic tool ribbon built from the existing platform names. The ribbon remains animated on motion-enabled devices and becomes a wrapped static list in reduced-motion mode.
- Improve touch hierarchy, label contrast, and spacing at `320–420px` widths.

### Contact finale

- Preserve the warm oat surface, contact headline, email, and call action.
- Recompose the panel into a stronger editorial close with an independent-consulting line, a short `Audit / Build / Enable` engagement rail, and clearer division between the call action and direct email.
- Keep the current truthful `30-minute intro call, no obligation` language.
- Left-align the mobile footer metadata and increase its contrast.

## Motion and Performance

- No new dependencies, images, WebGL, canvas, autoplay video, or rapidly changing effects.
- Keep hero material drift, query movement, and typographic tool movement; disable nonessential material drift on coarse pointers.
- All infinite motion stops under `prefers-reduced-motion: reduce`, and smooth scrolling becomes immediate.
- Replace twenty remote logo images with text, eliminating that external image group.
- Keep transform/opacity as the primary animated properties; height/grid transitions are limited to deliberate disclosure controls.

## Accessibility

- The page has one `main` landmark and a keyboard-visible skip link.
- Site navigation has an accessible name, current-section state, an Escape-close mobile menu, and at least `44px` touch controls.
- Decorative query lanes and the mobile visualisation do not flood the accessibility tree.
- Closed disclosure content is hidden from assistive technology and cannot contain focusable descendants.
- Focus indicators remain visible on paper and dark surfaces.
- Small metadata contrast is increased across hero proof, profile identity, decision proof, and contact footer.

## Responsive Contract

- No horizontal page overflow at `1440×900`, `1280×633`, `768×1024`, `390×844`, `375×812`, or `320×568`.
- At `320×568`, the primary action is fully visible in the first viewport.
- At mobile widths, the Insights window contains meaningful content as soon as it enters the viewport.
- Capability triggers remain at least `44px` high and reveal one detail at a time.
- The mobile menu fits within the viewport, can scroll internally, and does not move the page behind it.

## Verification Contract

- `main#main-content` and `.skip-link` exist.
- Each rendered navigation surface exposes its active item with `aria-current="page"`, and the fixed navigation includes a progress element.
- The mobile menu exposes `aria-controls`, closes on Escape, and contains the exact four chapter links plus Home.
- Insights has `data-mobile-dashboard="executive-snapshot"`; the window reveals before a `0.5` intersection threshold would have been reached.
- AI queries have one readable summary while the animated lanes are `aria-hidden="true"`.
- Closed methodology and capability details compute to `visibility: hidden`; active content computes to `visibility: visible`.
- The capability tools area contains no `img` elements and still lists all twenty platform names.
- Lint and production build exit successfully.
- Browser console has no errors, no Vite overlay is present, and all target breakpoints meet the responsive contract.
