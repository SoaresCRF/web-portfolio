import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // GitHub Pages serves this project site under /web-portfolio/
  base: '/web-portfolio/',
  plugins: [tailwindcss()],
  build: {
    // Two pages: Portuguese at the root and the English version under en/
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL('index.html', import.meta.url)),
        en: fileURLToPath(new URL('en/index.html', import.meta.url)),
      },
    },
    // Keep small images as files: inlining the footer icons would bloat the render-critical
    // index.html and defeat their loading="lazy"
    assetsInlineLimit: 0,
  },
});
