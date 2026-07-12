# Home Hero Redesign

## Context

The existing site has a coherent system: warm light-grey pages, near-black feature surfaces, emerald accents, editorial Playfair italics, utilitarian Inter, mono data labels, large rounded cards, and slow reveal motion. The current hero uses those ingredients but presents them as a familiar dark SaaS landing page: centered headline, ambient mesh, simulated cursors, and a docked dashboard. It explains the category but does not make Jabed's point of view memorable.

The redesign must feel related to the rest of the site while making the home page its most distinctive moment. The user explicitly delegated design decisions and requested implementation without an approval pause, so this spec records the selected direction rather than introducing a review gate.

## Approaches Considered

1. **Light editorial signal network — selected.** An asymmetric headline and an animated data-flow illustration make the consultant proposition clear without pretending to be a software product. It borrows the references' generous whitespace, big type, subtle gradients, and integrated product motion while remaining original.
2. **Dark typographic monolith.** Oversized kinetic type on a near-black field would preserve the current mood, but the change would feel evolutionary and would keep the home page visually close to a generic SaaS hero.
3. **Full-screen kinetic wordmark.** A primarily typographic hero would be bold and minimal, but it would communicate less of the end-to-end measurement craft that differentiates the site.

## Selected Concept

The home page becomes a light, borderless canvas titled **Make every signal count.** The left side carries the proposition and calls to action. The right side contains a purpose-built “measurement system”: source events flow through a dark central core and emerge as trusted business outcomes. The illustration is diagrammatic rather than a mock dashboard, so it reads as expertise and systems thinking rather than as a fictional product screenshot.

### Content hierarchy

- Eyebrow: “Independent data & analytics consultant” with an availability indicator.
- Headline: “Make every signal count.” The word “signal” uses the site's Playfair italic as the expressive beat.
- Supporting copy: “I build the measurement systems behind confident product decisions — from the first event to the final dashboard.”
- Primary action: “Schedule a call.”
- Secondary action: “Explore the system,” scrolling to the Who Am I section.
- Bottom proof line: “8+ years / 16 markets / €2M+ uplift,” presented as quiet inline evidence, not cards.

### Visual language

- Canvas: the existing `#f4f4f5`, allowing the hero to visually escape the card system.
- Type: Inter for clarity, Playfair Display italic for one editorial phrase, JetBrains Mono for labels and metrics.
- Accent: retain `#00df8e`, with pale mint, blue, and lilac atmospheric gradients used only behind the system graphic.
- Geometry: fine rules, open circles, compact data capsules, and one solid black core. No dashboard chrome, glass card stack, or decorative rounded container around the whole hero.
- Navigation: dark-on-light over the hero and middle sections; white-on-dark only over the contact section.

### Motion system

- Page-load sequence: eyebrow, headline lines, copy, actions, proof, and network enter in a restrained stagger.
- Network: packets travel along fixed SVG paths; rings rotate slowly; a scan wash passes through the field; labels breathe by a few pixels; the central pulse expands softly.
- Motion stays transform/opacity/stroke based and avoids layout movement.
- Hover: the primary CTA reveals its green arrow tile; the network labels lift subtly as a group.
- `prefers-reduced-motion` removes looping motion and shows every entrance in its final state.

## Component Boundaries

- `Hero.tsx` owns content, the semantic hero structure, and the decorative `SignalSystem` SVG/labels.
- `SiteNav.tsx` owns the light/dark navigation state and must treat the new hero as a light surface.
- `index.css` owns the hero animation primitives, responsive layout refinements, and reduced-motion overrides.
- Existing lower sections, data, links, and global interaction hooks remain unchanged.

## Responsive Behaviour

- Desktop (1024px+): asymmetrical 12-column split, headline left and signal system right.
- Tablet: keep the split while reducing headline and system scale; proof remains inline.
- Mobile: content stacks above a shortened signal system. Labels move inward, the system core scales down, proof becomes a three-column row, and the hero may exceed one viewport to avoid cramped content.
- The navigation remains legible at every hero breakpoint.

## Accessibility and Performance

- The network is `aria-hidden`; the proposition and actions remain the semantic content.
- The CTA labels are explicit and retain visible focus styles.
- SVG motion is decorative and disabled for reduced motion.
- CSS and SVG replace the previous timer-driven fake cursors, reducing JavaScript work and eliminating random animation state.
- External font families and the existing site-wide palette remain unchanged to avoid a disjointed first-to-second-section transition.

## Acceptance Criteria

- The old dark dashboard, animated graph, and fake cursors are absent.
- The hero contains the new headline, proposition, two actions, proof line, and signal-system marker.
- Navigation is dark and readable over the hero, then remains compatible with the contact section.
- No horizontal overflow occurs at 375px, 768px, 1440px, or wide desktop widths.
- Reduced motion leaves all hero content visible and stops looping decoration.
- `npm run lint` and `npm run build` exit successfully.
- Browser verification finds meaningful content, no framework overlay, and no console errors.
