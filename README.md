# Jabed Ahmed — Data systems consultancy

V2 portfolio site for measurement architecture, experimentation, and decision systems.

## About the site

This site presents Jabed Ahmed’s work across:

- Measurement architecture and tag management
- Server-side tracking and privacy-compliant data pipelines
- Conversion-rate optimisation and experimentation
- Analytics systems that support clearer business decisions

Visitors can explore capabilities, proof points, working methods, systems thinking, FAQs, and contact options.

## Experience

The desktop experience uses authored narrative scroll choreography. Each wheel or trackpad gesture advances by at most one intentional composition, so sections are not skipped accidentally.

Touch-first devices retain native browser scrolling. The site also respects reduced-motion preferences and includes keyboard-accessible navigation, a skip link, semantic landmarks, and focus-aware animated scenes.

The hero features a rotating, glyph-built data sculpture with three open-sheet formations: **Crystal**, **Weave**, and **Stream**. A minimal control strip offers Reshape and Pause, without explanatory captions or comparison buttons. On narrow screens the artwork sits between the headline and introduction, fading away as it passes behind the navigation. Offscreen artwork is hidden and inactive; scrolling back restores the selected formation and playback state. Reduced motion skips the gradual fade. Desktop behaviour, the orange/ink/paper identity and the two-stage entrance remain unchanged.

Process and example sequences have explicit playback controls; manual selection stays paused until Play is chosen. Examples also support previous/next, numbered selection and horizontal swipes. Illustrative figures are labelled as simulated data. Shared section links and native Back/Forward restoration are preserved.

See [docs/design-language/scroll-choreography.md](docs/design-language/scroll-choreography.md) for the interaction contract and implementation guidance.

## Technology

- React 19
- TypeScript
- Vite
- GSAP
- CSS
- Vitest and Testing Library
- Cloudflare Pages-compatible static output

## Copyright and reuse

© 2026 Jabed Ahmed. All rights reserved.

This repository is published as a project portfolio. No permission is granted to copy,
modify, redistribute, or reuse the code, design, content, or assets without written
permission.

## Local development

```bash
npm install
npm run dev
```

Available scripts:

```bash
npm run build    # Type-check and create a production build
npm run test     # Run the test suite
npm run lint     # Run Oxlint
npm run preview  # Preview the production build locally
```

## Project structure

- `src/` — React components, content, motion, styles, and tests
- `public/` — public assets
- `cloudflare/_headers` — production security headers
- `privacy.html` — privacy notice
- `docs/` — design and implementation documentation

## Privacy and security

The site includes a dedicated privacy notice and a restrictive production security-header configuration, including Content Security Policy, HSTS, clickjacking protection, MIME sniffing protection, and referrer-policy controls.

Contact is handled through email and an external booking link rather than an in-site form.

## Deployment

Build the site with:

```bash
npm run build
```

The generated production output can then be deployed through the project’s Cloudflare Pages workflow.
