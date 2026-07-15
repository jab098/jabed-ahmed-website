# Scroll choreography

Scroll is part of the site's design language. The document remains a real, native page, but eligible wheel, trackpad, and single-touch vertical gestures are interpreted as intent to move between authored narrative compositions.

## Invariant

One physical gesture may reach only the immediately adjacent waypoint in its direction.

- A small amount of direct movement is shown first, then the site completes the handoff.
- A very large wheel delta, fast swipe, or momentum tail cannot skip a headline or scene.
- Input received during a handoff is absorbed; it is never queued as another move.
- A fresh move requires a fresh gesture after wheel input has been quiet for at least `180ms`, or after the previous touch has ended.
- Meaningful headline, card, state, and closing-bridge compositions are destinations—not content to pass over.
- Adjacent resolved stops may never be more than `82vh` apart. Generated continuation stops keep tall content readable.

Explicit choices are different from gestures. A real navigation link, CTA, tab, browser find result, keyboard action, or scrollbar drag may move directly to its chosen position.

## Declaring waypoints

Add a stable content-based identifier to every physical headline or scene:

```tsx
<header data-scroll-waypoint="services-heading">...</header>
<section data-scroll-waypoint="contact">...</section>
```

Names describe the content, not its visual position. Keep them unique and do not mark decorative elements.

When adding a tall scene, mark every meaningful internal headline or composition. The waypoint builder measures the final ordered map and automatically inserts the minimum number of continuation stops needed to keep every interval at or below `0.82 * viewportHeight`. Do not add empty spacer markup or hand-authored filler stops.

The collector aligns physical points beneath `.site-nav`, clamps them to the document range, sorts them, and deduplicates positions within four CSS pixels. Authored destinations take priority over generated continuations.

## Pinned scenes

Pinned content has virtual states that cannot be represented by element `offsetTop` alone. Give its `ScrollTrigger` a stable ID:

```ts
ScrollTrigger.create({
  id: 'process-pin',
  // trigger, start, end, pin...
})
```

Declare each internal state with its trigger and a progress value inside the stable part of that state:

```tsx
<button
  data-scroll-virtual="process-02"
  data-scroll-trigger="process-pin"
  data-scroll-progress="0.34"
>
  Architect the system
</button>
```

The resolved vertical destination is:

```text
trigger.start + (trigger.end - trigger.start) * progress
```

For horizontal pinned tracks, mark the track and every scene:

```tsx
<div data-scroll-track data-scroll-trigger="systems-pin">
  <article data-scroll-track-waypoint="system-01">...</article>
</div>
```

Track progress is derived from each item's real `offsetLeft`, track width, viewport width, and leading inset. This keeps destinations correct when card sizes or gaps change.

## Responsive scenes

Use breakpoint-specific declarations when desktop and mobile tell the story differently:

```tsx
<article
  data-scroll-waypoint-desktop="capability-01"
  data-scroll-waypoint-mobile="capability-01"
>
  ...
</article>
```

- `data-scroll-waypoint-desktop` is active above `900px`.
- `data-scroll-waypoint-mobile` is active at `900px` and below.
- `data-scroll-waypoint` is active at every width.
- Desktop virtual and horizontal-track destinations are ignored on mobile.

Mobile content must be structurally present in narrative order. Do not hide required story states behind a single tabbed panel. Process, for example, renders four physical mobile scenes even though desktop uses one pinned panel with four virtual states.

When a section changes from a row to a stack, mark each stacked item as a mobile destination. The current inventory includes the hero report, proof metrics, four Process scenes, four System cards and bridge, six capability cards, every FAQ row, Contact, and Footer.

## Input behavior

Wheel and trackpad deltas are normalized from pixel, line, and page units. The intent threshold is `clamp(72px, 12vh, 120px)`. Input that becomes quiet below that threshold returns to its origin; committed input eases to one adjacent destination.

Single-touch gestures are classified after eight pixels of travel and only claimed when vertical travel is at least `1.25` times horizontal travel. The page follows the finger one-to-one, clamped to the adjacent interval. The commitment threshold is `clamp(56px, 10vh, 96px)`; shorter swipes return to their origin.

Handoffs animate real `window.scrollY` with GSAP `power3.inOut`. Duration is `clamp(520ms, 520ms + remainingDistance * 0.32ms, 980ms)`. The document is never translated into a virtual scroll surface.

The director never claims:

- `ctrl`-wheel zoom or multi-touch/pinch gestures;
- horizontal-dominant wheel or touch movement;
- an input before the page loader completes;
- an outward gesture at the top or bottom boundary;
- a gesture inside a nested `auto`/`scroll` region that can still move in that direction;
- input over a text field, textarea, select, or content-editable region;
- input while the site menu owns body scroll locking.

If a valid adjacent destination cannot be resolved, browser scrolling remains native.

## Accessibility exceptions

`prefers-reduced-motion: reduce` disables the narrative director completely. The browser retains native scrolling and existing reduced-motion presentation rules.

The system does not move focus, announce routine scroll changes, block pinch zoom, or apply `touch-action: none` to the page. Taps remain taps because touch default behavior is not cancelled until movement has been classified as a vertical swipe. Keyboard scrolling, focus-driven movement, browser find, and scrollbar dragging remain native.

The standalone privacy page does not mount the director.

## Dynamic layout

Waypoint geometry is cached outside wheel and touch hot paths. It rebuilds after:

- initial mount and `document.fonts.ready`;
- the loader-complete event;
- viewport resize or orientation change;
- a GSAP `ScrollTrigger` refresh;
- a `ResizeObserver` change to the main content or footer;
- FAQ transition completion.

Rebuild requests are coalesced into one animation frame. New sections therefore join the movement language through declarations rather than controller edits.

## Tests

Any section addition, removal, breakpoint change, or pinned-state change must update tests in the same change.

- Structural component tests assert every required desktop and mobile waypoint.
- `NarrativeScroll.test.tsx` covers physical, virtual, track, responsive, and nested-scroll mapping.
- `narrativeScroll.test.ts` covers delta normalization, one-stop clamping, momentum absorption, reversal, sub-threshold return, touch classification, and the `82vh` rule.
- `App.test.tsx` protects the chapter order, director mount, and this permanent README link.

A missing required scene must fail a structural test rather than silently disappearing from the journey.

## Release checklist

- Run `npm test -- --run`, `npm run lint`, `npm run build`, and `git diff --check`.
- Verify one small and one extreme wheel gesture in both directions with a mouse.
- Verify a high-resolution trackpad flick and its full momentum tail cannot advance twice.
- Verify short and long touch swipes at `390x844`, `375x812`, and `320x568`.
- Walk every Process state, System card, capability row/card, FAQ scene, Contact, and Footer without a skipped headline.
- Test FAQ expansion, the menu, nested scrolling, taps, horizontal movement, pinch zoom, anchors, keyboard navigation, scrollbar dragging, and Back to top.
- Test loader completion, resize/orientation changes, and reduced-motion mode.
- Confirm there are no console errors, Vite overlays, or horizontal page overflow before release.
