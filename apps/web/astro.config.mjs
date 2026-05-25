import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// Update this once a real domain is wired up in Vercel.
const SITE = 'https://531.dev';

export default defineConfig({
  site: SITE,
  integrations: [mdx(), react(), sitemap()],
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
