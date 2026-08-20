# GitHub Pages Deployment Verification

## Deployment status

On 20 August 2026, the portfolio was deployed successfully to the public GitHub Pages domain: [https://mohammedbajhaw.github.io/](https://mohammedbajhaw.github.io/). The repository is public and GitHub Pages is configured to use **GitHub Actions** as its publishing source.

| Item | Verified result |
|---|---|
| Repository | `MohammedBajhaw/mohammedbajhaw.github.io` |
| Deployment workflow | `Deploy portfolio to GitHub Pages` |
| Successful run | [Run #4](https://github.com/MohammedBajhaw/mohammedbajhaw.github.io/actions/runs/32345273672) |
| Build outcome | Successful; static Next.js output uploaded as the Pages artifact |
| Public root | [https://mohammedbajhaw.github.io/](https://mohammedbajhaw.github.io/) |
| Project archive | [https://mohammedbajhaw.github.io/projects](https://mohammedbajhaw.github.io/projects) |
| Services | [https://mohammedbajhaw.github.io/services](https://mohammedbajhaw.github.io/services) |
| Administration sign-in | [https://mohammedbajhaw.github.io/admin](https://mohammedbajhaw.github.io/admin) |

## Workflow correction

The first GitHub Actions attempts failed because `setup-node` attempted to cache pnpm before pnpm was available. The workflow now runs `pnpm/action-setup@v4` before `actions/setup-node@v4` and relies on the pinned package-manager version in `package.json`. The successful run confirms that the corrected order installs dependencies, builds the static export, uploads the `out/` directory, and deploys it to GitHub Pages.

## Supabase authentication configuration

The Supabase Authentication URL configuration now points to the GitHub Pages deployment. No private, service-role, or secret values are recorded in this document.

| Setting | Configured value |
|---|---|
| Site URL | `https://mohammedbajhaw.github.io` |
| Allowed redirect URL | `https://mohammedbajhaw.github.io` |
| Allowed redirect URL | `https://mohammedbajhaw.github.io/admin` |

## Browser verification

The public home page, project archive, services page, and administration sign-in page each loaded successfully from the user's browser at the GitHub Pages domain. The administration page was verified through its unauthenticated sign-in screen; a manual owner sign-in and image-upload test remains a separate follow-up item.

## Follow-up items

The next release should be triggered automatically whenever `main` changes. A later custom-domain connection, the owner-authenticated image-upload check, and an optional mobile hero portrait remain outside this deployment verification.

## References

[1]: https://github.com/MohammedBajhaw/mohammedbajhaw.github.io/actions/runs/32345273672 "Successful GitHub Pages deployment run"
[2]: https://mohammedbajhaw.github.io/ "Mohammed Bajhaw engineering portfolio"
