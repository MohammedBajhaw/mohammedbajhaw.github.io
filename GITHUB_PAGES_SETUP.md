# GitHub Pages deployment

This portfolio is configured for an account-level GitHub Pages repository named **`mohammedbajhaw.github.io`** under the `MohammedBajhaw` account. Export this project to that repository from the project settings, then open the repository’s **Settings → Secrets and variables → Actions** page and add these repository secrets:

| Secret | Value source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The publishable key beginning with `sb_publishable_` |

Next, open **Settings → Pages**. Under **Build and deployment**, choose **GitHub Actions**. The included workflow deploys the static site to `https://mohammedbajhaw.github.io/` when the `main` branch is updated.

After the first Pages deployment, add these redirect URLs in **Supabase → Authentication → URL Configuration**:

```text
https://mohammedbajhaw.github.io
https://mohammedbajhaw.github.io/admin
```

The Supabase publishable key is intentionally used only in the browser with Row Level Security enabled. Do not add a Supabase secret/service-role key to GitHub or the website.
