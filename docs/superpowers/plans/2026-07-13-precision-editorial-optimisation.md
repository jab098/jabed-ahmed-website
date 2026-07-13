# Precision Editorial Optimisation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the approved editorial redesign into a more coherent, accessible, performant, and deliberately responsive single-page consulting site.

**Architecture:** Preserve the existing React section boundaries and data sources. Add navigation state and semantic page framing, introduce small presentation components for the mobile decision snapshot and tool ribbon, and keep the visual system in the existing stylesheet with explicit breakpoint and reduced-motion contracts.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4 utility classes, authored CSS, Lucide React.

## Global Constraints

- Do not add dependencies, images, WebGL, canvas, autoplay video, or unverified business claims.
- Preserve the exact hero headline `Data you can trust. Decisions you can defend.`.
- Preserve the existing warm paper, ink, green accent, Playfair contrast, and dark decision-room palette.
- All infinite motion stops under `prefers-reduced-motion: reduce`.
- No horizontal overflow at `1440×900`, `1280×633`, `768×1024`, `390×844`, `375×812`, or `320×568`.

---

### Task 1: Establish failing rendered-page contracts

**Files:**
- Test: live page at `http://127.0.0.1:4174/`
- Reference: `docs/superpowers/specs/2026-07-13-precision-editorial-optimisation-design.md`

**Interfaces:**
- Consumes: current rendered DOM and computed styles.
- Produces: recorded RED evidence for semantic framing, navigation state, mobile decision snapshot, disclosure visibility, and text-only tools.

- [x] **Step 1: Run a desktop browser contract before implementation**

Evaluate the rendered page for `main#main-content`, `.skip-link`, `[aria-current="page"]`, `.site-scroll-progress`, `[data-mobile-dashboard="executive-snapshot"]`, and `.capability-tools img`.

Expected: the first five contracts are absent and the tools area contains images.

- [x] **Step 2: Run a mobile disclosure contract before implementation**

At `375×812`, inspect computed `visibility` for a closed `.capability-detail` and `.ai-method-collapse`.

Expected: closed content remains `visible`, proving the accessibility defect.

### Task 2: Add semantic page framing and context-aware navigation

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/SiteNav.tsx`
- Modify: `src/data.ts`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `NAV_LINKS`, `CALENDLY_URL`, `EMAIL`, section IDs.
- Produces: `main#main-content`, `.skip-link`, active navigation state, `.site-scroll-progress`, and `#mobile-site-menu`.

- [x] **Step 1: Add semantic framing**

Wrap page sections in `<main id="main-content">`, add `<a className="skip-link" href="#main-content">Skip to content</a>`, and keep the cursor/navigation outside the landmark.

- [x] **Step 2: Track current section and reading progress**

Extend the existing rAF-coalesced scroll handler to select the section crossing the navigation anchor, apply `aria-current="page"` to its link, and imperatively update a progress-bar transform.

- [x] **Step 3: Build the editorial mobile menu**

Render a persistent panel with numbered links, the independent-consulting descriptor, email, and call action; toggle `aria-hidden`, `inert`, and body overflow; close on Escape and link selection.

- [x] **Step 4: Verify navigation GREEN**

Confirm one current link per navigation surface, working progress transform, keyboard Escape close, focus containment, body scroll restoration, and no overlay at desktop/mobile widths.

### Task 3: Refine hero and profile responsiveness

**Files:**
- Modify: `src/components/Hero.tsx`
- Modify: `src/components/WhoAmI.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: existing hero copy and `WHO_STATS`.
- Produces: compact CTA label, structured profile metadata, numbered practice rail, refined proof descriptions.

- [x] **Step 1: Add compact hero CTA markup**

Provide desktop and compact labels within the same accessible link, hiding only the duplicate visual text with responsive CSS.

- [x] **Step 2: Recompose profile metadata and practices**

Use separate descriptor/location spans and render each practice with a `0N` index in the existing list.

- [x] **Step 3: Add compact-height CSS**

At `max-width: 420px` and `max-height: 680px`, reduce vertical spacing and type scale, keep actions in one row, and hide the duplicated hero proof strip.

- [x] **Step 4: Verify hero/profile GREEN**

At `320×568`, assert the primary CTA bottom is within the viewport and the page has zero horizontal overflow; at `375×812`, confirm the full proof strip remains present.

### Task 4: Make Insights immediate and meaningful on mobile

**Files:**
- Modify: `src/components/Insights.tsx`
- Modify: `src/components/AiSearch.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `CHART_DATA`, `COMPETITORS`, existing AI query/method arrays.
- Produces: `[data-mobile-dashboard="executive-snapshot"]`, screen-reader summaries, and correctly hidden closed methods.

- [x] **Step 1: Lower the dashboard reveal threshold**

Change the chart observer threshold from `0.5` to `0.12` and shorten the boot delay so the dashboard content is present on the first Insights viewport.

- [x] **Step 2: Implement the executive mobile snapshot**

Render the final visibility value, January-to-June change, a simplified SVG trend, and the top three platforms; keep it presentation-only and add a concise visually-hidden summary.

- [x] **Step 3: Clean the AI accessibility tree**

Mark animated query lanes decorative, add one visually-hidden query-theme summary, and expose disclosure open state through a data attribute that controls visibility.

- [x] **Step 4: Verify Insights GREEN**

At `375×812`, confirm meaningful snapshot text is visible when the decision window enters the viewport, closed method visibility is hidden, and opening it reveals five notes.

### Task 5: Refine capability interaction and replace the logo strip

**Files:**
- Modify: `src/components/Service.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `SERVICES` and the twenty names in `LOGOS`.
- Produces: inactive detail visibility/inert semantics and a text-only animated tool ribbon.

- [x] **Step 1: Hide inactive capability content semantically**

Set an open-state data attribute, `aria-hidden`, and inert semantics on detail regions; align CSS visibility timing with the grid-row transition.

- [x] **Step 2: Replace logo images with typography**

Render the existing twenty platform names in duplicated animated groups with decorative separators and one accessible first copy.

- [x] **Step 3: Refine touch and focus styling**

Increase small-label contrast, keep triggers above `44px`, use a linear keyboard focus treatment, and preserve one-active-row behavior.

- [x] **Step 4: Verify capabilities GREEN**

Confirm six triggers, exactly one expanded row after click/focus, closed detail visibility hidden, all twenty names present, and zero tool images.

### Task 6: Strengthen the contact ending and global motion/accessibility CSS

**Files:**
- Modify: `src/components/Contact.tsx`
- Modify: `src/index.css`
- Modify: `index.html`

**Interfaces:**
- Consumes: `CALENDLY_URL`, `EMAIL`, current contact copy.
- Produces: engagement rail, availability cue, improved footer contrast, correct theme colour, and reduced-motion scroll behavior.

- [x] **Step 1: Recompose the contact panel**

Add the independent-consulting line and `Audit / Build / Enable` rail while preserving the existing headline, call link, email, and no-obligation note.

- [x] **Step 2: Finish global accessibility CSS**

Style the skip link, add `:focus-visible` coverage, set `html { scroll-padding-top }`, set `scroll-behavior: auto` for reduced motion, increase low-contrast metadata, and disable nonessential coarse-pointer material drift.

- [x] **Step 3: Align document chrome**

Change the theme colour meta value to `#f3efe6` and leave existing SEO copy intact.

- [x] **Step 4: Verify contact/motion GREEN**

Confirm email and CTA touch targets, left-aligned mobile footer, visible keyboard focus, and no active infinite animations under reduced motion.

### Task 7: React review and full verification

**Files:**
- Review: all modified `src/**/*.tsx`
- Review: `src/index.css`
- Review: `index.html`

**Interfaces:**
- Consumes: completed implementation.
- Produces: verified production-ready working tree.

- [x] **Step 1: Run React best-practices review**

Check hook cleanup/dependencies, semantic controls, stable list keys, accessibility attributes, and unnecessary render-time allocations; apply only scoped fixes.

- [x] **Step 2: Run static verification**

Run `npm run lint`, `npm run build`, and `git diff --check`.

Expected: all commands exit `0`; build reports production asset sizes.

- [x] **Step 3: Run browser verification**

Reload from a cold page, check for Vite overlays and console errors, exercise menu/accordion/method/dashboard controls, and verify all six target viewports.

- [x] **Step 4: Re-read the design contract**

Check each item in `docs/superpowers/specs/2026-07-13-precision-editorial-optimisation-design.md` against rendered evidence and record any remaining gap before claiming completion.
