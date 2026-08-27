# Projects Archive Repair Verification

## Audit outcome

The archive issue resulted from two separate faults. First, client-side Supabase hydration treated `/manus-storage/` paths as Supabase bucket paths, so those managed image paths became invalid URLs and rendered as broken-image alt text. Second, the archive used a bare image element outside the established card-media frame. The bare element could expand vertically according to the image rather than presenting the project title and details in a coherent card.

## Desktop verification

The repaired desktop archive displays nine consistent project cards in a three-column grid. Every card now has a fixed **16:10** media frame, a visible status, title, summary, and a compact tag row. Existing portrait, diagram, and landscape images are contained within the frame rather than cropped or stretched. Managed `/manus-storage/` paths are delivered through a narrowly scoped Supabase Edge Function so that the browser receives an actual image response rather than an invalid bucket URL.

## Expected mobile verification

At widths below 760 px, the archive switches to one card per row and each card uses a **16:9** media frame. This prevents the narrow three-column image-only layout reported in the supplied mobile screenshot. Desktop and mobile screenshots were captured after the proxy response was confirmed as `200 image/jpeg`; both show the complete card treatment for every project.
