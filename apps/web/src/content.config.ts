import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    pubDate: z.coerce.date(),
    // Optional loop metadata — populated by the loop agent.
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
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
