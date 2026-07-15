# Native Touch Scrolling Design

## Context

The site’s narrative scroll director gives wheel and trackpad users one authored composition per physical gesture. That controlled motion is intentional on laptops and desktop displays, but it is a poor fit for phones, tablets, and other touch-first devices where users expect direct, continuous finger scrolling.

Viewport width cannot identify the input model: a tablet can be wide, a desktop window can be narrow, and a hybrid laptop can expose touch without being touch-first. The boundary must therefore be based on the browser’s primary input capabilities.

## Decision

The narrative scroll director mounts only when both of these touch-first signals are absent:

- the browser reports at least one touch point through `navigator.maxTouchPoints`;
- the primary input matches `(hover: none) and (pointer: coarse)`.

When both signals are present, document scrolling remains fully native. The component returns before registering GSAP motion, adding `html.narrative-scroll-active`, collecting waypoints, or attaching wheel, touch, transition, resize, and delegated navigation listeners.

Fine-pointer and hover-capable laptops/desktops retain the existing narrative scrolling exactly, including narrow desktop windows. A hybrid touchscreen laptop whose primary input remains fine/hover-capable also keeps the desktop experience.

## Behavioural Contract

### Touch-first devices

- Finger scrolling is continuous browser-native scrolling.
- No partial-gesture preview, threshold, rollback, snap, or automatic handoff runs.
- A long swipe may travel naturally through as much content as browser momentum produces.
- Section links, keyboard navigation, scrollbar movement, pinch zoom, and focus-driven movement remain browser-native.
- Responsive waypoint attributes may remain in the markup for narrow fine-pointer windows, but touch-first devices ignore them because the director never mounts.

### Fine-pointer devices

- Existing authored waypoints, one-gesture/one-landing ownership, easing, durations, and input safeguards are unchanged.
- Detection must never use viewport width or user-agent strings.

### Accessibility

`prefers-reduced-motion: reduce` continues to disable the director independently of input capability. Either reduced motion or a touch-first primary input is sufficient to keep document scrolling native.

## Verification

Component tests must prove that:

- a touch-first environment never activates or registers narrative input/navigation listeners;
- a narrow viewport with a fine primary pointer still activates the narrative director;
- the pure capability predicate requires both touch support and the touch-first media query;
- reduced-motion behaviour remains native.

Browser verification must confirm the active class is absent under mobile touch emulation and present under desktop fine-pointer emulation. The full test, lint, TypeScript/Vite build, and diff checks remain release gates.

## Design-Language Safeguard

Future scroll work must treat touch-first native scrolling as an input-mode invariant, not a temporary mobile exception. New sections may add authored desktop/narrow-fine-pointer waypoints without reintroducing touch interception.
