import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  return rss({
    title: '531 — Dev log',
    description: 'What an AI coding agent shipped, every 30 minutes.',
    site: context.site ?? 'https://531.dev',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
  });
}
