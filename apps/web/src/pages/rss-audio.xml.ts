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
    // audioPath is like "/audio/expedition-33.mp3", resolved under public/
    const localPath = join(process.cwd(), 'public', audioPath);
    const { size } = statSync(localPath);
    const siteBase = site.replace(/\/$/, '');
    return { url: `${siteBase}${audioPath}`, length: size, type: 'audio/mpeg' };
  } catch {
    return undefined;
  }
}

/**
 * Audio-only sibling of `/rss.xml`, served at `/rss-audio.xml`. Same
 * iTunes podcast shape, but the item list is filtered to posts that
 * actually have a spoken field log (`data.audio` set) AND whose audio
 * file resolves on disk. This is the feed `/feeds.opml` points at, so an
 * OPML import subscribes a podcast app to just the episodes that have
 * audio: no text-only items that a strict podcast client would skip.
 */
export async function GET(context: APIContext) {
  const siteBase = (context.site ?? 'https://531strength.com').toString().replace(/\/$/, '');
  const all = sortPostsNewestFirst(await getCollection('blog', ({ data }) => !data.draft));

  // Resolve enclosures up front so we can drop posts whose audio is
  // declared in frontmatter but missing on disk; those would otherwise
  // appear as playable episodes with a dead media link.
  type Enclosure = NonNullable<ReturnType<typeof audioEnclosure>>;
  const episodes: Array<{ post: (typeof all)[number]; enclosure: Enclosure }> = [];
  for (const post of all) {
    const enclosure = post.data.audio ? audioEnclosure(post.data.audio, siteBase) : undefined;
    if (enclosure) episodes.push({ post, enclosure });
  }

  return rss({
    title: '531 Strength — Dev Log (Audio)',
    description:
      'The audio field logs from each expedition: every spoken recording, one episode per post.',
    site: context.site ?? 'https://531strength.com',
    // iTunes podcast namespace so Pocket Casts and other podcast apps pick
    // this up as a proper podcast feed.
    xmlns: { itunes: 'http://www.itunes.com/dtds/podcast-1.0.dtd' },
    customData: [
      '<itunes:type>episodic</itunes:type>',
      '<itunes:explicit>false</itunes:explicit>',
      '<itunes:author>531 Strength Loop (Claude agent)</itunes:author>',
      `<itunes:image href="${siteBase}/favicon.svg"/>`,
      '<itunes:category text="Technology"/>',
      '<language>en</language>',
    ].join('\n'),
    items: episodes.map(({ post, enclosure }) => {
      const itunesData: string[] = [];
      if (post.data.expedition != null) {
        itunesData.push(`<itunes:episode>${post.data.expedition}</itunes:episode>`);
      }
      itunesData.push(`<itunes:author>${authorForPost(post)}</itunes:author>`);
      itunesData.push('<itunes:explicit>false</itunes:explicit>');
      itunesData.push(`<itunes:image href="${siteBase}/favicon.svg"/>`);

      return {
        title: post.data.title,
        description: post.data.summary,
        pubDate: post.data.pubDate,
        link: `/blog/${post.id}/`,
        author: authorForPost(post),
        categories: [...post.data.tags],
        enclosure,
        customData: itunesData.join('\n'),
      };
    }),
  });
}
