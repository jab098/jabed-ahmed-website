# Texture-Led Hero and Paper Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace the ambiguous signal-network hero with explicit data-led typography and animated material texture, then extend a warm light paper palette through the site and contact panel.

**Architecture:** Simplify `Hero.tsx` to semantic copy plus four decorative texture layers. Centralise page colours and shared CTA styling in `index.css`, convert page sections to reusable paper classes, and simplify navigation now that every page-level surface is light.

**Tech Stack:** React 19, TypeScript 6, Tailwind CSS 4 utilities, authored CSS keyframes, Lucide React.

## Global Constraints

- Headline text must be exactly “Data you can trust. Decisions you can defend.”
- No data diagram, event label, orbit, pulse, scan line, status light, or small blinking object may remain.
- Page paper is `#F3EFE6`; contact paper is `#E6DED1`; ink is `#0A0D10`; accent remains `#00DF8E`.
- Do not change dark colours inside the Insights dashboard mock.
- Add no dependencies or image assets.
- All decorative motion must support `prefers-reduced-motion: reduce`.

---

### Task 1: Establish the second-iteration browser contract

**Files:**
- Test: rendered home route at the active Vite URL.

**Interfaces:**
- Consumes: current committed first-iteration DOM.
- Produces: a failing assertion for headline, network removal, spectrum texture, and contact palette.

- [x] **Step 1: Verify the baseline project**

Run `npm run lint` and `npm run build`.

Expected: both exit `0` before production edits.

- [x] **Step 2: Run the pre-implementation assertion**

```js
JSON.stringify({
  headline: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim(),
  network: Boolean(document.querySelector('[data-hero-system="signal-network"]')),
  texture: Boolean(document.querySelector('[data-hero-texture="spectrum"]')),
  contactDark: getComputedStyle(document.querySelector('#contact')).backgroundColor === 'rgb(5, 5, 5)',
})
```

Expected RED: old headline, `network: true`, `texture: false`, and `contactDark: true`.

### Task 2: Replace the signal system with the texture-led hero

**Files:**
- Modify: `src/components/Hero.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `CALENDLY_URL`, `useMagnetic`, `ArrowDown`, and `ArrowUpRight`.
- Produces: semantic `Hero()` markup and `[data-hero-texture="spectrum"]`.

- [x] **Step 1: Remove the diagram implementation**

Delete `FLOW_PATHS`, `STATIC_NODES`, `SignalLabel`, `SignalSystem`, SVG motion, and the right-hand system wrapper.

- [x] **Step 2: Render the new semantic hero**

```tsx
<h1>
  <span>Data you can trust.</span>
  <span><em>Decisions</em> you can defend.</span>
</h1>
```

Add the revised eyebrow, supporting copy, primary action, secondary `#who` action, and existing proof points.

- [x] **Step 3: Build the spectrum texture**

Render one wrapper with `data-hero-texture="spectrum"` containing a blurred colour band, two colour veils, broad contour arcs, and static paper grain. Mark the wrapper `aria-hidden="true"`.

- [x] **Step 4: Replace old hero CSS**

Delete all `.signal-system`, `.signal-map`, `.signal-orbit`, `.signal-core`, `.signal-label`, `.signal-packet`, `.signal-scan`, and `.signal-live-status` rules. Add `.texture-hero`, `.hero-spectrum-*`, `.texture-heading`, `.site-primary-cta`, responsive, short-height, and reduced-motion rules.

### Task 3: Extend the paper palette through the site

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/WhoAmI.tsx`
- Modify: `src/components/Insights.tsx`
- Modify: `src/components/Service.tsx`
- Modify: `src/components/Contact.tsx`
- Modify: `src/components/SiteNav.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: CSS variables `--paper`, `--paper-panel`, `--surface`, `--ink`, and `--accent`.
- Produces: `.site-shell`, `.paper-section`, `.paper-card-muted`, and `.contact-panel`.

- [x] **Step 1: Add paper surface classes**

Use `.site-shell` on `App` and `.paper-section` on Who Am I, Insights, and Service. Use `.paper-card-muted` on the statistic cards.

- [x] **Step 2: Restyle contact**

Change the contact section to `.contact-panel`, remove white text and the dark marker variant, add dark metadata/borders, and reuse `.site-primary-cta` with an `ArrowUpRight` icon.

- [x] **Step 3: Simplify navigation**

Remove `onLight`, the contact measurement, and colour-branching classes. Keep scroll visibility, mobile-menu state, dark text, and the existing dark mobile popover.

### Task 4: Verify the revised experience

**Files:**
- Verify: all files modified in Tasks 2 and 3.

**Interfaces:**
- Consumes: completed implementation.
- Produces: static, DOM, interaction, responsive, visual, and reduced-motion evidence.

- [x] **Step 1: Run lint and production build**

Run `npm run lint` and `npm run build`.

Expected: both exit `0`.

- [x] **Step 2: Run the green browser contract**

Expected: exact new headline, `network: false`, `texture: true`, and a non-black contact background.

- [x] **Step 3: Verify behaviour and accessibility**

Confirm meaningful body content, no Vite overlay, no page/console errors, two hero actions, five mobile-menu links, and correct reduced-motion computed styles.

- [x] **Step 4: Verify responsive layouts**

Capture 1440×900, 768×1024, 375×812, and 1280×633. Confirm readable hierarchy, visible CTA, no clipping, and zero horizontal overflow.

- [x] **Step 5: Review final diff**

Run `git diff --check`, `git diff --stat`, `git status --short`, and scan for removed signal-system selectors.
