# Gesture epochs, viewport framing, and Method motion design

## Context

The authored narrative-scroll system now lands on semantic headlines, pinned states, cards, Contact, and Footer compositions. Recent hardening fixed layout-shift drift, FAQ hover movement, pre-animation card flashes, and a Safari failure where wheel input could remain disarmed until the pointer moved.

The liveness fix retained any wheel input arriving inside the final 20% of an active handoff and promoted post-landing input into a one-slot semantic queue. That solved the stationary-pointer symptom but introduced a more serious invariant break: the momentum tail from one long trackpad swipe or line-wheel burst can be mistaken for a second physical gesture and advance two adjacent waypoints.

The supplied large-display screenshots also expose two composition problems. The Proof stop is shorter than the available viewport and reveals a readable portion of the Process headline. The FAQ stop aligns its sticky heading to the navigation edge while the section remains content-height, leaving a large part of the following white Contact surface visible. Both positions are geometrically valid but visually unauthored.

Additional approved refinements restore the earlier metric count-up, replace abrupt Process panel remounts with a professional crossfade, redesign the first Process visual so it communicates diagnosis rather than a score, and eliminate transient clipped headline fragments on tall displays.

## Goals

- Preserve the hard invariant that one physical wheel, trackpad, or touch gesture can reach only one adjacent authored destination.
- Keep the recent liveness guarantee: a genuinely fresh gesture near an active landing must register without pointer movement or clicking.
- Make Proof and FAQ full, isolated viewport compositions on desktop so no following section surface or readable content appears at their stops.
- Restore the proven count-up behaviour while retaining the current clipped upward fade.
- Make Process state changes crossfade without a blank frame, hard replacement, lateral motion, or flash.
- Replace the `62/100` audit score with a reverse evidence trace that visibly diagnoses a decision.
- Ensure every large masked headline is fully settled and free of compositor remnants at its authored waypoint.
- Record the learned bugs, safeguards, responsive rules, and release checks as permanent design language.

## Non-goals

- Do not replace real document scrolling with a transformed smooth-scroll surface.
- Do not change the approved scroll-handoff durations or sinusoidal ease family.
- Do not add new narrative waypoints, label-only stops, or spacer stops.
- Do not convert the metrics back to stacked digit reels.
- Do not add blur, skew, or lateral movement to Process transitions.
- Do not make every site section full-viewport; viewport framing remains an explicit authored choice.

## Gesture ownership

### Rejected approaches

1. **Hard cooldown after every landing.** This prevents skips but recreates the recently fixed dead-input feeling when a deliberate second gesture begins while a handoff is finishing.
2. **Tune the final-20% heuristic.** A different percentage still classifies by animation position rather than physical gesture ownership, so results remain dependent on hardware momentum shape and viewport distance.
3. **Keep the current unconditional post-landing queue.** This guarantees liveness by allowing the exact momentum tail that must remain absorbed.

### Selected model: gesture epochs

Wheel input is grouped into a physical stream epoch. An epoch begins with an eligible event while the director is armed and owns one semantic landing token. After that token commits, every event belonging to the same epoch is absorbed, regardless of total delta, event count, whether the handoff has entered its final phase, or whether the visual animation has already landed.

The epoch closes only after a verified quiet boundary. A first event after that boundary begins a new epoch. If the previous handoff is still active, the new epoch may reserve exactly one adjacent semantic destination; otherwise it starts normally from the settled waypoint.

The quiet deadline remains independent of pointer movement and slides whenever an accepted event arrives from the currently owned epoch, including after landing. Those events remain absorbed and cannot be promoted into a queued destination. Only a full `180ms` of verified quiet releases ownership; the next eligible event after that callback begins a fresh epoch without requiring pointer movement or a click.

The director therefore distinguishes two things that the current code conflates:

- **absorbed tail:** more events from the epoch that already spent its landing token;
- **queued fresh intent:** the first committed input from an epoch that began after a verified release boundary.

Pixel, line, and page deltas remain normalized. A single extreme event is still one epoch. A dense line-wheel burst and a trackpad momentum tail remain one epoch until quiet. Touch already has explicit `touchstart` and `touchend` boundaries; one committed touch session remains one landing token, and a later touch session may reserve one adjacent move.

Direction reversal before commitment retains the existing return-to-origin behaviour. Reversal after commitment remains absorbed by the owning epoch and cannot create an extra landing.

## Viewport-framed compositions

Introduce an explicit `data-scroll-frame="viewport"` declaration and a shared navigation-height design token. A framed composition has a minimum block size equal to the usable viewport beneath the fixed navigation. Content may make the frame taller, but it may never be shorter.

This is an authored presentation rule, not a new waypoint type. The collector still resolves the element carrying the semantic waypoint.

### Proof

On desktop, the complete four-column Proof grid becomes the viewport frame. Its existing section-level `proof` waypoint remains at the frame boundary. All four tiles stretch through the usable viewport. The later approved Proof content-band refinement centres the title and metric blocks on a shared line at `60%` of the frame rather than pinning them to the bottom. At the landing, only Proof is visible beneath the navigation; neither the Process surface nor the `// How I work` label may appear.

At `900px` and below, the existing stacked Proof destinations remain physical per-card stops. The desktop full-grid frame must not turn each mobile card into an unnecessarily oversized desktop-like panel.

### FAQ

The semantic `faq-heading` waypoint moves from the sticky header to the complete FAQ section frame. The black section fills at least the usable viewport and the two-column headline/list composition is optically centred within it. At the landing, no white Contact surface is visible.

Expanded answers may grow the section naturally. Sticky heading behaviour remains available while the enlarged FAQ is traversed. Passive FAQ geometry rebuilds continue preserving the current viewport and semantic row identity.

### Future sections

Use viewport framing only when the complete composition is intended to own the screen. A following colour field or headline may appear only when explicitly designed as a teaser. Accidental readable content from the next section is a framing defect, not a reason to add a waypoint.

## Proof metric motion

Restore the earlier `CountUp` interaction from the site's history rather than reintroducing digit reels.

- `8+` counts from `0` to `8`.
- `16` counts from `0` to `16`.
- `€2M+` uses the earlier fine-grained `0.5` to `2.0` progression so the easing is visible, then settles to the exact final string `€2M+`.
- The numeric portion uses the earlier cubic ease-out over `2.4s` and runs once on first meaningful intersection.
- Prefixes and suffixes remain stable, and tabular numerals prevent width jitter.
- The existing value wrapper still fades and rises from its mask.
- The article's accessible name always exposes the final value.
- Reduced-motion mode renders the final string immediately and disables both count and rise motion.

## Process state transitions

The current keyed copy and display nodes remove the outgoing state synchronously before mounting the incoming state. Their CSS only animates the replacement from opacity zero, producing a visible blank/flash.

Replace that remount with a stable two-layer state transition:

1. Keep the outgoing copy and visual mounted.
2. Mount the incoming state at opacity zero above or beside it in the same layout box.
3. Crossfade the two layers over approximately `480ms` using the site's restrained editorial ease.
4. Remove the outgoing layer only after the incoming layer is established.
5. Start internal diagram animation after the incoming shell has become visible, so artwork cannot blink before its containing card.

Copy and visual share the same transition generation. Rapid state changes cancel stale completion callbacks and retain the newest requested state. The shell never becomes blank. Motion remains opacity-only; the scroll handoff owns all spatial movement.

Mobile Process scenes remain physical, sequential content and do not use the desktop state crossfade.

## Diagnose visual

Replace `TRUST SCORE 62/100` with a reverse evidence trace. The visual starts from a decision and works backwards through the evidence required to defend it.

The selected composition contains:

- a clear decision card, `CAN WE TRUST THE LIFT?`;
- evidence lanes for exposure, conversion, identity, and consent;
- connectors that trace from the decision back toward those signals;
- explicit fault markers such as `IDENTITY JOIN`, `CONSENT LOSS`, and `DUPLICATE PURCHASE`;
- a concluding diagnostic strip containing `SIGNALS CHECKED`, `BLOCKERS FOUND`, and `NEXT ACTION / FIX IDENTITY JOINS`.

The entrance sequence reveals the decision first, draws the reverse connectors, then marks the blockers and conclusion. There is no aggregate score, percentage bar, or `/100` denominator. This keeps the visual distinct from Process step 02, which shows the forward architecture of the system.

## Headline settling

Process, Systems, and Contact use translated inner spans inside clipped line masks. Their ScrollTriggers currently use a numeric `0.7s` scrub, so the animation playhead can continue catching up after the document has reached the authored waypoint. On tall Safari viewports this temporarily exposes antialiased fragments beneath a line before the transform finally reaches zero.

The scroll position already has a time-based preview filter and a smooth GSAP handoff. The headline reveal therefore uses direct scroll-linked progress at the final approach rather than an additional delayed scrub. At the authored endpoint the child transform is forced to its exact final value and its temporary compositor transform is released. The mask remains ink-safe, and reverse traversal restores the reveal state correctly.

Apply the same settling rule to every scroll-scrubbed masked headline, not only the reported Process line.

## Documentation and failure-mode ledger

Extend `docs/design-language/scroll-choreography.md` with:

- viewport-framed composition declarations and the full-isolation rule;
- gesture epoch ownership and one-token semantics;
- sliding quiet boundaries that rearm input after actual quiet without promoting momentum;
- a correction removing the final-20% queue rule;
- known failures covering label-only stops, partial cards, momentum promotion, pointer-dependent rearming, FAQ hover/reflow, stale geometry, pre-animation flashes, and delayed headline compositor remnants;
- count-up and crossfade reduced-motion requirements;
- the expanded browser, hardware, and viewport release matrix.

## Test strategy

### Pure director tests

- One extreme pixel event reaches one adjacent waypoint.
- A long pixel stream continuing through the final 20%, landing, and post-landing tail reaches only one waypoint.
- A dense line-mode burst reaches only one waypoint.
- A fresh epoch after verified quiet reserves one adjacent move while the current handoff is active.
- A fresh epoch after landing registers without pointer movement or clicking.
- Continuous tail events slide the quiet boundary and remain one landing until actual quiet.
- A later third epoch cannot be hidden inside a one-slot follow-on.
- Touch retains one-session/one-landing parity.

### Component and DOM tests

- Proof and FAQ declare viewport framing at the correct semantic elements.
- Desktop Proof keeps its one section-level stop; mobile keeps three per-card stops.
- FAQ keeps row destinations on mobile and moves the heading waypoint to the section frame.
- Metrics expose the final accessible values, contain count-up hooks, and contain no digit reels.
- Process contains no `62/100` score and exposes the reverse evidence trace and blocker conclusion.
- Process state changes retain outgoing and incoming layers during the transition.
- Headline timelines use the shared exact-settling configuration.

### Real-browser verification

- Safari and Chrome with a stationary pointer.
- Long high-resolution trackpad swipe and momentum tail.
- Long line-wheel burst and a single extreme delta.
- Deliberate second gesture during the final approach and shortly after landing.
- Touch at `390x844`, `375x812`, and `320x568`.
- Desktop at `1440x900`, the supplied approximately `1499x886`, `2554x1425`, and tall `1455x1279` viewports.
- Proof and FAQ full isolation, metric counts plus rise, Process crossfades, reverse evidence trace, and absence of headline fragments.
- Reduced motion, FAQ expansion/hover, menu, anchors, nested scrolling, keyboard, and scrollbar behaviour.

## Acceptance criteria

- One physical input stream never advances more than one adjacent authored destination.
- A genuinely fresh gesture registers automatically after release without pointer movement.
- Proof and FAQ show no following section surface at their desktop landings.
- All three Proof values rise and count to their exact final strings once.
- Process state changes never show a blank or hard replacement frame.
- The first Process visual communicates causal diagnosis and contains no aggregate score.
- Masked headlines are fully settled at every authored stop without transient lines.
- Tests, lint, TypeScript/Vite build, diff checks, Chrome verification, and Safari verification pass.
- The permanent design-language document records the final rules and learned failure modes.
