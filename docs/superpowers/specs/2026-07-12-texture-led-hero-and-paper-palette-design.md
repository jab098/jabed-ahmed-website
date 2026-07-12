# Texture-Led Hero and Paper Palette

## Context

The first light redesign improved the site’s tone, hierarchy, and perceived quality, but the animated signal network created two problems. Its labels and orbiting dots looked like a product interface without explaining a real product, and the headline “Make every signal count” required visitors to infer that “signal” meant digital data. The user wants the data proposition to be immediate and is open to removing the data illustration in favour of colour and texture.

This iteration keeps the successful light direction, removes the diagram completely, and extends a warmer paper palette through the full site and contact section.

## Approaches Considered

1. **Typographic spectrum field — selected.** A direct data headline sits over a slow-moving, blurred material texture. It delivers the strongest clarity, removes the need to decode an illustration, and uses animation as atmosphere rather than explanation.
2. **Minimal data ribbon.** A single animated line of event names could keep a data-specific visual cue, but it risks recreating the same “interface without meaning” problem in a smaller form.
3. **Static editorial cream canvas.** Pure typography and whitespace would be highly professional, but it would lose too much of the animated character requested for the home page.

## Selected Hero

### Copy

- Eyebrow: “Data collection · experimentation · analytics”.
- Headline: “Data you can trust. Decisions you can defend.”
- Supporting copy: “I design reliable tracking, experimentation and reporting systems for ambitious digital products.”
- Primary action: “Schedule a call”.
- Secondary action: “See how I work”.
- Proof: retain “8+ years / 16 markets / €2M+ uplift”.

The word “Decisions” uses the existing Playfair italic as the expressive moment. “Data” appears in the first word of the headline, so the category is immediate.

### Composition

- The hero uses one centred content column with a maximum width large enough for two desktop headline lines.
- There is no right-hand column, diagram, product mock, event label, pulse, scan line, status light, or blinking object.
- The spectrum field spans the full hero behind the copy. It is intentionally non-literal.
- Desktop copy is centred; mobile copy is left aligned for easier reading and a less cramped CTA stack.

### Texture and motion

- Base: warm cream `#F3EFE6`.
- Spectrum: blurred mint, sky, lilac, butter, and restrained peach fields.
- Texture: a static fine paper grain and a very low-contrast set of broad contour arcs.
- Animation: two large colour veils drift and scale over 24–34 seconds. No animation uses rapid opacity changes, flashing, pulsing, or small point lights.
- Entrance motion remains a one-shot soft rise and blur.
- Reduced-motion mode freezes every texture layer and shows content immediately.

## Site Palette

- Page paper: `#F3EFE6`.
- Light card/surface: `#FBF9F4`.
- Deeper paper panel: `#E6DED1`.
- Ink: `#0A0D10`.
- Accent: retain `#00DF8E`.

The app shell, Who Am I, Insights, and Service section backgrounds use page paper. Existing white service cards remain as a lighter offset. Statistic cards use the deeper paper surface. Dark analytics-dashboard interiors remain unchanged because their internal contrast is part of the dashboard mock, not the page canvas.

## Contact and Navigation

- The contact card changes from black to deeper oat paper with dark text, a subtle border, and a low-opacity spectrum bloom.
- The contact CTA reuses the same black pill and green arrow treatment as the hero.
- The email and footer metadata use dark ink with reduced opacity.
- Because every page-level surface is now light, the fixed navigation stays dark-on-light throughout the page. The dark mobile menu remains self-contained.

## Component Boundaries

- `Hero.tsx`: concise semantic content and decorative texture layers only.
- `Contact.tsx`: warm light panel content and shared CTA markup.
- `SiteNav.tsx`: scroll visibility and mobile-menu state only; no surface-colour detection.
- `App.tsx`, `WhoAmI.tsx`, `Insights.tsx`, and `Service.tsx`: opt into paper surface classes.
- `index.css`: palette variables, spectrum field, shared CTA, contact bloom, responsive layout, and reduced-motion behaviour.

## Accessibility and Performance

- Texture layers are `aria-hidden` and contain no text.
- The headline is one semantic `h1` with exact text content.
- Both calls to action remain native links with visible focus states.
- Motion uses only transforms and opacity on a small number of large layers.
- Removing the SVG network, six SMIL paths, orbit rings, labels, and dots reduces DOM and animation complexity.

## Acceptance Criteria

- The rendered headline is exactly “Data you can trust. Decisions you can defend.”
- No `[data-hero-system="signal-network"]`, `.signal-packet`, `.signal-label`, or blinking status element remains.
- A `[data-hero-texture="spectrum"]` layer is present and decorative.
- The page canvas is warm cream and the contact section is a light oat panel, not black.
- Navigation text remains dark over hero, page sections, and contact.
- Mobile menu behaviour is unchanged.
- Reduced motion disables texture drift and entrance animation.
- No horizontal overflow occurs at 375px, 768px, 1440px, or short desktop height.
- `npm run lint`, `npm run build`, browser console checks, and browser error checks pass.
