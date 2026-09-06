# Kinetic Capability Compositions Design

## Goal

Make the capability selector feel materially different on every selection while preserving the approved selector-and-canvas structure and every capability demonstration's internal content.

## Capability order

1. Front-End Instrumentation
2. Tag Management
3. Server-Side Tracking
4. CRO & Testing
5. Consent & Privacy
6. BI & Data Modelling

Front-End Instrumentation is selected by default so its interaction trace is the first demonstration visitors see.

## Composition system

Each capability owns a stable layout slug independent of its numerical position. On desktop, the active demonstration and explanatory copy use capability-specific positioning variables so changing tabs changes the whole composition, not only the contents of a fixed frame. The demonstration artwork inside each frame remains unchanged.

The six compositions vary horizontal anchor, vertical anchor, frame scale and copy alignment while keeping the status header readable and the frame within the dark canvas. A short orange signal rail visually connects the selector boundary to the current composition.

## Motion

Selection changes retain the previous panel for a 480ms transition. The previous composition exits toward its authored direction while the current composition enters from its own direction. Opacity and moderate translation provide the transition; there is no rotation, blur or decorative motion system. Repeated selection cancels stale cleanup timers.

Reduced-motion visitors receive immediate stable states. On mobile, the selector remains horizontal and the demonstration remains stacked above its copy; only a restrained directional fade distinguishes changes so readability and page height stay predictable.

## Accessibility and verification

Only the current panel is exposed as the active tabpanel. The outgoing visual layer is inert and hidden from assistive technology. Existing click and arrow-key navigation remains intact. Verification covers ordering, default state, keyed demo mapping, transition cleanup, reduced motion, horizontal overflow and full-page layouts at desktop, tablet, phone and short-landscape sizes.
