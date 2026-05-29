import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

const SITE = 'https://531strength.com';

export default defineConfig({
  site: SITE,
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-light',
      },
      wrap: true,
    },
  },
  vite: {
    ssr: {
      noExternal: ['@fontsource-variable/*', '@fontsource/*'],
    },
  },
});
