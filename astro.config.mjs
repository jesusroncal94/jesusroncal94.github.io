import { defineConfig } from 'astro/config';
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
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    server: { watch: { usePolling: pollForFileChanges } },
  },
});
