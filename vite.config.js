import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import prerenderGigs from './build/prerender-gigs.js';

function sitemapLastmod() {
  return {
    name: 'sitemap-lastmod',
    closeBundle() {
      const path = resolve(__dirname, 'dist/sitemap.xml');
      const content = readFileSync(path, 'utf-8');
      const today = new Date().toISOString().split('T')[0];
      writeFileSync(path, content.replace('__BUILD_DATE__', today));
      console.log(`[sitemap-lastmod] Set lastmod to ${today}`);
    },
  };
}

export default defineConfig({
  base: '/',
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  plugins: [prerenderGigs(), sitemapLastmod()],
  server: {
    port: 0, // Dynamic port allocation
    open: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
