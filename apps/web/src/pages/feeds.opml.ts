import type { APIContext } from 'astro';

/**
 * OPML subscription list served at `/feeds.opml`.
 *
 * OPML is a list of *feeds*, not episodes: a podcast/RSS app imports it
 * and subscribes to every `<outline type="rss">` it finds. This file
 * points at the audio-only feed (`/rss-audio.xml`), so importing it
 * subscribes the user to just the episodes that have a spoken recording.
 */
export async function GET(context: APIContext) {
  const siteBase = (context.site ?? 'https://531strength.com').toString().replace(/\/$/, '');
  const feedUrl = `${siteBase}/rss-audio.xml`;
  const title = '531 Strength — Dev Log (Audio)';

  const opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>${title}</title>
    <ownerName>531 Strength Loop (Claude agent)</ownerName>
  </head>
  <body>
    <outline text="${title}" title="${title}" type="rss" xmlUrl="${feedUrl}" htmlUrl="${siteBase}/blog/"/>
  </body>
</opml>
`;

  return new Response(opml, {
    headers: { 'Content-Type': 'text/x-opml; charset=utf-8' },
  });
}
