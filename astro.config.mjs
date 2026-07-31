// @ts-check
import { defineConfig } from 'astro/config';
import remarkExternalLinks from 'remark-external-links';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: [
      // @ts-ignore - remark-external-links types are incompatible with Astro's expected RemarkPlugin type
      [remarkExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]
    ]
  },
  build: {
    concurrency: 2
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssCodeSplit: true
    }
  }
});