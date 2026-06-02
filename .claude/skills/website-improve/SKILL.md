# website-improve

Run each do-work iteration via the loop-criteria "Make the website better" category.
Reads strategy from `loop-memory/17-website-improve-strategy.md`, identifies the next
actionable step, executes it, posts questions to Discord `#needs-input` when blocked,
and updates the progress tracker.

## What this skill covers

The website lives in `apps/web/` — an Astro static site deployed to 531strength.com. This skill
handles anything that makes 531strength.com better for visitors: SEO, copy accuracy, UX, technical
health, and the blog framework. Marketing strategy and post drafts live in the `organic-marketing`
agent — don't duplicate that work here.

## Per-iteration checklist

1. **Read the strategy** at `loop-memory/17-website-improve-strategy.md`. Every field matters.

2. **Read `#needs-input` for Alex's replies** (channel ID: `1509774367498829935`). If Alex
   answered a pending question last loop, act on the answer now.

3. **Pick the next actionable step** from the progress tracker. A step is actionable if:
   - All blocking assets/decisions are available
   - You can make the change in code or content directly

4. **Execute the change**: edit the Astro files, update copy, fix technical issues,
   improve blog templates, etc.

5. **Update the progress tracker** in the strategy file:
   - Change status from `pending` → `done · expedition N`
   - Add research notes at the bottom

6. **Post to `#needs-input` if blocked**:
   - Only post one question at a time (don't flood the channel)
   - Be specific: what decision or asset is needed, why it matters, what you'll do when it arrives
   - Use the curl recipe in the strategy file

7. **Build the website** to verify: `cd apps/web && pnpm build` (or equivalent).
   The build must pass before the commit.

## What NOT to do

- Don't introduce new visual styles that break the e-ink paper aesthetic
- Don't change the expedition-logs fiction (Logger, Verso, the painting) — that's `loop-memory/14-lore.md`
- Don't create marketing post drafts — that's the `organic-marketing` agent
- Don't post anything to external platforms
- Don't use color emojis in website body copy

## Key file locations

```
apps/web/src/
  layouts/Base.astro   # global head (meta, og:, JSON-LD)
  pages/
    index.astro        # homepage (CSS extracted to styles/home.css in expedition 46)
    process.astro      # how-it's-built page (CSS extracted to styles/process.css in expedition 46)
    blog/index.astro   # blog listing
    blog/expedition-logs.astro
  components/
    TopBar.astro
    Footer.astro
  styles/
    global.css
    tokens.css
```
