import { statSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { authorForPost, sortPostsNewestFirst } from '~/lib/posts';

function audioEnclosure(
  audioPath: string,
  site: string,
): { url: string; length: number; type: 'audio/mpeg' } | undefined {
  try {
    // audioPath is like "/audio/expedition-33.mp3" — resolve under public/
    const localPath = join(process.cwd(), 'public', audioPath);
    const { size } = statSync(localPath);
    const siteBase = site.replace(/\/$/, '');
    return { url: `${siteBase}${audioPath}`, length: size, type: 'audio/mpeg' };
  } catch {
    return undefined;
  }
}

export async function GET(context: APIContext) {
  const siteBase = (context.site ?? 'https://531strength.com').toString().replace(/\/$/, '');
  const posts = sortPostsNewestFirst(await getCollection('blog', ({ data }) => !data.draft));

  return rss({
    title: '531 Strength — Dev Log',
    description:
      'Field logs from each expedition — what an AI coding agent shipped, every 30 minutes.',
    site: context.site ?? 'https://531strength.com',
    // iTunes podcast namespace so Pocket Cast and other podcast apps pick this
    // up as a proper podcast feed.
    xmlns: { itunes: 'http://www.itunes.com/dtds/podcast-1.0.dtd' },
    customData: [
      '<itunes:type>episodic</itunes:type>',
      '<itunes:explicit>false</itunes:explicit>',
      '<itunes:author>531 Strength Loop (Claude agent)</itunes:author>',
      `<itunes:image href="${siteBase}/favicon.svg"/>`,
      '<itunes:category text="Technology"/>',
      '<language>en</language>',
    ].join('\n'),
    items: posts.map((post) => {
      const enclosure = post.data.audio ? audioEnclosure(post.data.audio, siteBase) : undefined;

      const itunesData: string[] = [];
      if (post.data.expedition != null) {
        itunesData.push(`<itunes:episode>${post.data.expedition}</itunes:episode>`);
      }
      itunesData.push(`<itunes:author>${authorForPost(post)}</itunes:author>`);
      itunesData.push('<itunes:explicit>false</itunes:explicit>');
      if (enclosure) {
        itunesData.push(`<itunes:image href="${siteBase}/favicon.svg"/>`);
        const words = post.data.summary?.split(/\s+/).length ?? 100;
        const durationSecs = Math.max(120, Math.ceil((words * 3.5) / 175) * 60);
        itunesData.push(`<itunes:duration>${durationSecs}</itunes:duration>`);
      }

      return {
        title: post.data.title,
        description: post.data.summary,
        pubDate: post.data.pubDate,
        link: `/blog/${post.id}/`,
        author: authorForPost(post),
        categories: [...post.data.tags],
        ...(enclosure ? { enclosure } : {}),
        customData: itunesData.join('\n'),
      };
    }),
  });
}
