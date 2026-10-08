import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const pollForFileChanges = process.env.WATCH_MODE === 'polling';

export default defineConfig({
  site: 'https://jesusroncal94.github.io',
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'it'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.endsWith('/cv/') && !page.includes('/og/'),
      i18n: { defaultLocale: 'en', locales: { en: 'en', es: 'es' } },
    }),
  ],
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
    server: { watch: { usePolling: pollForFileChanges } },
  },
});
