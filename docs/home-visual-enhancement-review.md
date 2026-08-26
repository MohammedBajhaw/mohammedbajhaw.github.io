# Home Visual Enhancement Review — 2026-08-21

## Desktop review

The revised homepage preserves the restrained technical-editorial layout. The Hero retains a clear type hierarchy, exposes the new CV action alongside the main project and service actions, and now reserves a structured portrait panel that will prefer the profile photo managed in Supabase.

The project archive maintains a readable six-card grid and has an image-layer interaction treatment with a case-study cue. The redesigned footer provides a clear contact path and keeps CV, LinkedIn, and phone access together in a calm final panel.

## Validation notes

- The original generated-image reservation returned a 404 response during visual review. The first managed-asset fallback was also unavailable from the user's browser. The Hero therefore uses a stable temporary portrait from an independent image CDN, while the CV remains on its absolute managed-asset URL. The caption explicitly identifies the portrait as a temporary visual.
- The future user-uploaded profile photo remains the priority whenever `profiles.photo_url` is populated.
- The visual changes retain a reduced-motion override and keyboard focus states for project cards and footer links.
- The final mobile review confirms that the portrait and technical detail panel retain a compact, two-column composition near the Hero, the CV action remains visible, and the project archive continues as a single readable column above the redesigned footer.
- GitHub Actions run 18 for the final asset-link correction completed its visible 1m 20s run duration before the public verification step.
- GitHub Actions run 20 for the independent Hero image completed its visible 1m 02s run duration. The public homepage is ready for final browser verification.
- The live-content update passed 40 automated checks and the static export build. GitHub Actions run 22 completed successfully, publishing browser-side Supabase reads for the home page, projects, services, project details, and publication details.

## User portrait source

The user provided the portrait at `https://drive.google.com/file/d/1gchfxU8Z95s_hxdefkXtkqsRBHsuWsHZ/view`. The image is a graduation portrait and was downloaded to `/home/ubuntu/webdev-static-assets/mohammed-bajhaw-portrait.jpg` for the asset record. Google Drive's standard `view` and `download` URLs did not render in the Hero image element; the compatible direct preview is `https://lh3.googleusercontent.com/d/1gchfxU8Z95s_hxdefkXtkqsRBHsuWsHZ=w1200`, which is stored in the Supabase profile `photo_path`.
