# Post-Hero Editorial Chapters Design

## Problem

The hero now has a distinctive material and editorial voice, but the three sections beneath it fall back to familiar SaaS patterns: a repeated narrow title column beside a wide content column, statistic cards, a dashboard card, and a six-card capability grid. The repetition makes the scroll feel templated and understates the depth of the work.

## Goal

Turn the profile, insights, and services sections into three visually distinct chapters that still belong to the hero's warm paper, black ink, serif contrast, green accent, and unhurried motion system.

## Direction

Use an **editorial chapters** composition.

- Rejected: another bento-grid treatment. It would be newer than the current layout but would preserve the same card-first SaaS language.
- Rejected: canvas, WebGL, or 3D spectacle. It would compete with the consulting message, add weight, and weaken accessibility.
- Selected: oversized editorial typography, continuous ledgers and rules, one immersive dark case-study room, and an interactive capability index. This provides contrast and movement without turning the site into a product template.

## Chapter 1: Profile Manifesto

The Who Am I section becomes a full-width statement with `data-profile-layout="editorial-ledger"`.

- Section label: `N°01 / Profile`.
- Main statement: `I make complex products measurable.` The word `measurable.` uses Playfair italic.
- Supporting copy: `I work across product, engineering and growth to build measurement systems that stay useful as teams, markets and regulation change.`
- Identity line: `Independent data & analytics consultant · London / worldwide`.
- Retain the LinkedIn action.
- Replace the three rounded statistic cards with one ruled proof ledger containing `8+ years`, `16 markets`, and `€2M+ uplift`.
- Retain the count-up behaviour, shortened to feel decisive rather than theatrical.
- Add a low-contrast material spectrum wash and a practice rail: `Collect / Govern / Experiment / Explain`.

The layout is asymmetrical but not a standard sidebar. The statement spans the page; supporting copy sits in the lower-right negative space; the ledger forms the section's baseline.

## Chapter 2: Decision Room

The Insights section becomes a full-width black case-study environment with `data-insights-stage="decision-room"`.

- Place the whole experience inside one large rounded dark room rather than a cream left column beside a dashboard card.
- Section title: `Evidence, not instinct.` with `not instinct.` in Playfair italic.
- Supporting copy: `Measurement architecture and experimentation that turns uncertain product questions into measurable commercial outcomes.`
- Add small proof annotations: `Governed measurement`, `16-market scale`, and `€2M+ annual uplift`.
- Keep the interactive dashboard and all its existing desktop controls, but present it as an embedded working artifact beneath the section narrative.
- Remove the outer dotted-card framing. Use a soft green, blue, and lilac bloom plus fine contour lines behind the dashboard.
- Preserve the existing mobile presentation of the dashboard.
- Switch the fixed navigation to its light treatment only while it overlaps the dark decision-room bounds; profile, services, and the light contact panel retain dark navigation.

### AI Search Field

The AI Search content stays within the decision-room chapter but loses the white pill-marquee aesthetic.

- Headline: `Search is becoming an answer.`
- Supporting sentence: `I structure and measure the signals that help brands appear, get cited and understand what happens next.`
- Render queries as three ruled typographic ticker lanes with small source glyphs and green separators.
- Rename the disclosure action to `See the method`.
- Render the expanded methodology as a numbered two-column field of ruled notes, not a white card.

## Chapter 3: Capability Index

The Services section becomes a split editorial index with `data-service-layout="capability-index"`.

- Section title: `Six capabilities. One connected system.` with `connected system.` in Playfair italic.
- A sticky introduction occupies the left side on desktop.
- The right side contains six ruled capability rows, not cards.
- Each row always shows its number, discipline, icon, and title.
- One row is active at a time. Hover, focus, or click activates it and reveals its description and technology stack through a grid-row transition.
- The first capability is active on initial render.
- Each trigger is a semantic button with `aria-expanded` and `aria-controls`.
- Mobile uses the same accessible accordion structure without sticky positioning.
- Keep the tool logo marquee as a quiet ruled footer to the capability chapter.

## Visual System

- Page paper remains `#F3EFE6`.
- Dark room uses `#090B0D`, warm white text, and the existing `#00DF8E` accent.
- No new images, dependencies, gradients that flash, or status lights.
- Rounded corners are reserved for the decision room and existing contact panel; profile and capability content use rules and open space instead of nested cards.
- Mono is reserved for section numbers, metadata, disciplines, and tool labels.
- Motion is limited to reveal entrances, slow material drift, dashboard interactions, ticker movement, and accordion transitions.

## Responsive Behaviour

- Desktop: manifesto statement spans the section, decision room uses the full content width, and the capability introduction is sticky beside the index.
- Tablet: manifesto ledger remains horizontal, decision-room header stacks above the dashboard, capability index becomes a single column.
- Mobile: left-align all editorial headings, stack proof ledger cells, keep dashboard content within the viewport, and retain large tap targets on capability rows.
- No horizontal page overflow at 1440×900, 768×1024, 375×812, or 1280×633.

## Accessibility and Motion

- Decorative layers are `aria-hidden="true"`.
- All capability controls are keyboard operable and expose expanded state.
- Existing dashboard buttons remain functional.
- `prefers-reduced-motion: reduce` disables material drift, tickers, reveal transforms, and accordion transition animation while keeping all content visible.

## Verification Contract

- The profile has the exact new statement, the editorial-ledger marker, and zero `.paper-card-muted` statistic cards.
- The Insights section has the decision-room marker and retains the Overview, Prompts, Sources, Models, and Settings controls.
- The Services section has the capability-index marker, six capability triggers, and zero `.card-spotlight` service cards.
- Capability activation updates `aria-expanded` and the visible detail copy.
- Lint and production build exit successfully.
