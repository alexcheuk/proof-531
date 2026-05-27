import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    // Full ISO 8601 datetime, NOT just a calendar date. We sort posts by
    // `pubDate.valueOf()` (see `lib/posts.ts`); a date-only value buckets
    // every post on a given day to midnight UTC and falls back to a slug
    // tiebreak, which puts posts out of order. The dev-blog template in
    // `loop-memory/03-dev-blog.md` documents the expected shape. Existing
    // entries: 2026-05-26T16:39:04-07:00.
    pubDate: z.coerce.date(),
    // Optional loop metadata — populated by the loop agent. `loopIso` was
    // historically used as a sort fallback; it's now redundant with
    // pubDate but kept on the schema for the posts that have it.
    loopId: z.string().optional(),
    loopIso: z.string().optional(),
    discordPrompts: z
      .array(
        z.object({
          author: z.string(),
          channel: z.string().default('#task-queue'),
          text: z.string(),
        }),
      )
      .optional(),
    commitCount: z.number().optional(),
    // Logger-only fields (added 2026-05-27 with the Verso→Paintress shift).
    // `expedition` is the narrative counter that runs in parallel to `loopId`:
    // Logger posts get the next sequential expedition number; off-cycle and
    // Verso-mode posts omit it. `loggerName` is the one-off given name the
    // Logger signed with — see loop-memory/04-dev-blog-persona.md.
    expedition: z.number().int().positive().optional(),
    loggerName: z.string().optional(),
    tags: z.array(z.string()).default([]),
    // Scope is the structural dimension we filter `/blog` on: which surface(s)
    // the post is primarily about. `tags` stays for fine-grained content tags
    // (session, design, bug-postmortem, etc.). Multi-value because a single
    // loop often ships across mobile + web. The `expedition` value joined the
    // enum on 2026-05-27 — every Logger post carries it alongside its surface
    // scope; older Verso/Margin posts do not.
    scope: z.array(z.enum(['mobile', 'web', 'loop', 'meta', 'expedition'])).min(1),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
