import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // GitHub Pages serves this project site under /web-portfolio/
  base: '/web-portfolio/',
  plugins: [tailwindcss()],
});
