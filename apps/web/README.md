# @fivethreeone/web

Public-facing marketing site + live dev log for the 531 mobile app.

- **Stack:** Astro 5 + MDX + React (islands available, none currently used) + IBM Plex via `@fontsource`.
- **Output:** static. No runtime server needed.
- **Design tokens:** ported 1:1 from `apps/mobile/src/design/tokens.ts` into `src/styles/tokens.css`. That file is the **only** place hex/px literals live — same boundary rule as the mobile app.
- **Blog:** Astro content collection at `src/content/blog/`. Schema in `src/content.config.ts`.
- **RSS:** `/rss.xml`, sitemap at `/sitemap-index.xml`.

## Local dev

```bash
pnpm --filter @fivethreeone/web dev       # http://localhost:4321
pnpm --filter @fivethreeone/web build     # static output to ./dist
pnpm --filter @fivethreeone/web typecheck # astro check
```

From repo root:

```bash
pnpm build:web
```

## Deploy (Vercel)

One-time setup in the Vercel dashboard:

1. **New Project → import this repo.**
2. **Root Directory:** `apps/web`
3. **Framework Preset:** Astro (auto-detected)
4. **Build Command:** `pnpm --filter @fivethreeone/web build` (overrides Vercel's default so it runs from the monorepo root and picks up workspace deps)
5. **Output Directory:** `dist`
6. **Install Command:** `pnpm install` (run from the repo root — Vercel handles this automatically when it detects `pnpm-workspace.yaml`)
7. **Node version:** 22 (matches the `.nvmrc` / engines field at the repo root)

No env vars are required. Production deploys trigger on every push to `main`; preview deploys trigger on every other branch / PR.

The first deploy will give you a `*.vercel.app` URL. Point the custom domain at it when ready.

## Writing a new blog entry

See `loop-memory/03-dev-blog.md`. The short version:

1. Create `src/content/blog/<YYYY-MM-DD>-<slug>.md`.
2. Fill in the required frontmatter (`title`, `summary`, `pubDate`, `loopId`, …).
   Schema is enforced — `pnpm --filter @fivethreeone/web build` will fail loudly if the frontmatter is wrong.
3. Push to `main`. Vercel rebuilds; the entry is live in ~30 seconds.

## Layout

```
apps/web/
  src/
    components/      # Hero, FeatureGrid, BlogCard, Footer, TopBar, Section, Stat
    content/blog/    # Markdown entries — one per loop
    content.config.ts
    layouts/Base.astro
    pages/
      index.astro
      blog/index.astro
      blog/[...slug].astro
      rss.xml.ts
    styles/
      tokens.css     # the single source of truth for hex/px
      global.css
```

## Why Astro, not Next.js

The site is 95% content (landing + markdown blog). Astro ships zero JS by default, has first-class content collections with type-safe frontmatter, and lets us drop a React island in if we ever need interactivity. The full client runtime weight today is a single ~60 KB gzipped chunk from the React integration; if we never use a React component on the page, we can remove the integration and that drops to near zero.
