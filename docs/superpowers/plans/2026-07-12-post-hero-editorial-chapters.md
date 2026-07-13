# Post-Hero Editorial Chapters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace the three generic post-hero layouts with an editorial profile manifesto, immersive decision room, and interactive six-capability index.

**Architecture:** Rewrite the outer composition of `WhoAmI`, `Insights`, `AiSearch`, and `Service` while preserving existing data, dashboard interactions, reveal hooks, and navigation anchors. Add section-specific authored CSS to `index.css`, reuse shared paper variables and typography, and remove obsolete card-only selectors after their consumers disappear.

**Tech Stack:** React 19, TypeScript 6, Tailwind CSS 4 utilities, authored CSS, Lucide React, agent-browser DOM assertions.

## Global Constraints

- Profile statement is exactly `I make complex products measurable.`
- Insights title is exactly `Evidence, not instinct.`
- Services title is exactly `Six capabilities. One connected system.`
- Keep all six existing service definitions and all existing dashboard controls.
- Add no dependencies or image assets.
- Preserve `#F3EFE6` page paper, `#090B0D` dark room, and `#00DF8E` accent.
- Do not commit, push, merge, or open a pull request.
- All decorative motion must support `prefers-reduced-motion: reduce`.

---

### Task 1: Establish the old-layout browser contract

**Files:**
- Test: rendered home route at the active Vite URL.

**Interfaces:**
- Consumes: current committed post-hero DOM.
- Produces: a failing contract for all three replacement layouts.

- [x] **Step 1: Run the pre-implementation assertion**

```js
JSON.stringify({
  profileEditorial: Boolean(document.querySelector('[data-profile-layout="editorial-ledger"]')),
  profileCards: document.querySelectorAll('#who .paper-card-muted').length,
  decisionRoom: Boolean(document.querySelector('[data-insights-stage="decision-room"]')),
  capabilityIndex: Boolean(document.querySelector('[data-service-layout="capability-index"]')),
  serviceCards: document.querySelectorAll('#service .card-spotlight').length,
})
```

Expected RED: `false`, `3`, `false`, `false`, and `6`.

### Task 2: Build the profile manifesto and proof ledger

**Files:**
- Modify: `src/components/WhoAmI.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `WHO_STATS`, `LINKEDIN_URL`, `useReveal`, `MagneticLink`, and `SectionMarker`.
- Produces: `[data-profile-layout="editorial-ledger"]`, `.profile-statement`, and `.profile-proof-ledger`.

- [x] **Step 1: Replace the split-column profile markup**

Render the exact statement, identity line, supporting copy, LinkedIn action, practice rail, and proof ledger. Keep `CountUp` private to the file and use the existing `WHO_STATS` values.

- [x] **Step 2: Replace statistic-card CSS with the editorial profile system**

Add the material wash, oversized statement, asymmetrical copy placement, ruled ledger, tablet/mobile stacking, entrance motion, and reduced-motion overrides. Remove `.stat-rise` and `.stat-grid-wrapper` rules after their consumers are gone.

### Task 3: Turn Insights into a decision room

**Files:**
- Modify: `src/components/Insights.tsx`
- Modify: `src/components/AiSearch.tsx`
- Modify: `src/components/SiteNav.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: all existing dashboard state, typed data, visualisations, and controls.
- Produces: `[data-insights-stage="decision-room"]`, `.decision-room`, `.decision-window`, and `.ai-field`.

- [x] **Step 1: Replace the repeated 3/9 outer grid**

Move the section marker, exact title, supporting copy, and proof annotations into a full-width dark header. Place the unchanged mobile and desktop dashboard shells inside one decision-window below it.

- [x] **Step 2: Restyle the dashboard stage**

Replace the cream dotted background and nested generic card frame with one dark room, slow material bloom, contour texture, and full-width artifact composition. Keep all control handlers and visualisation state unchanged. Switch the fixed navigation to light text only while its anchor line overlaps the decision-room bounds.

- [x] **Step 3: Recompose AI Search**

Render the exact new headline and supporting sentence, use ruled query ticker lanes, rename the disclosure to `See the method`, and turn the expanded methodology into numbered ruled notes.

- [x] **Step 4: Add responsive and reduced-motion behaviour**

Stack the decision-room header on tablet/mobile, preserve the existing mobile dashboard, prevent horizontal overflow, and disable bloom/ticker/reveal motion under reduced motion.

### Task 4: Replace six service cards with the capability index

**Files:**
- Modify: `src/components/Service.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `SERVICES`, `LOGOS`, `useReveal`, and `SectionMarker`.
- Produces: `[data-service-layout="capability-index"]` and six accessible `.capability-trigger` buttons.

- [x] **Step 1: Add one-active-row state**

Use `useState(0)` in `Service`. Every trigger sets the active index on click, focus, or pointer enter and exposes `aria-expanded` plus a stable `aria-controls` target.

- [x] **Step 2: Render the sticky introduction and ruled index**

Render the exact title and supporting copy in the left introduction. Render all six service definitions as open rows with a collapsed detail grid rather than cards.

- [x] **Step 3: Style interaction and responsive behaviour**

Add active-row wash, number/icon movement, grid-row detail transition, large focus rings, desktop sticky positioning, mobile stacking, and reduced-motion overrides. Remove card spotlight and service-card-only glow usage.

- [x] **Step 4: Retain the logo marquee as the chapter footer**

Keep all 20 logo records and the three-copy seamless track, but add a quiet `Selected tools` label and align the ruled strip with the new index.

### Task 5: Verify the complete scroll sequence

**Files:**
- Verify: all files modified in Tasks 2–4.

**Interfaces:**
- Consumes: completed implementation.
- Produces: static, DOM, interaction, responsive, visual, and reduced-motion evidence.

- [x] **Step 1: Run lint and production build**

Run `npm run lint` and `npm run build`. Expected: both exit `0`.

- [x] **Step 2: Run the green browser contract**

Expected: all three data markers are present, profile and service card counts are `0`, the three exact headings match, and six capability triggers render.

- [x] **Step 3: Verify interaction and accessibility**

Activate capability 04 and confirm only its trigger has `aria-expanded="true"` and its details are visible. Exercise the dashboard metric and sidebar controls. Confirm the AI Search disclosure opens and closes.

- [x] **Step 4: Verify responsive layouts**

Capture the full post-hero sequence at 1440×900, 768×1024, 375×812, and 1280×633. Confirm no horizontal overflow, readable type, unobscured controls, and complete capability copy.

- [x] **Step 5: Verify reduced motion and final diff**

Confirm profile/room/index entrances and ticker animations compute to `none`, all content remains visible, `git diff --check` passes, and removed card selectors have no remaining consumers.
