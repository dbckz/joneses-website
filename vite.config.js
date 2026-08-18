import { defineConfig, loadEnv } from 'vite';
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
      writeFileSync(path, content.replaceAll('__BUILD_DATE__', today));
      console.log(`[sitemap-lastmod] Set lastmod to ${today}`);
    },
  };
}

function inlineCss() {
  return {
    name: 'inline-css',
    closeBundle() {
      const htmlFiles = [
        'dist/index.html',
        'dist/upcoming-gigs/index.html',
        'dist/book-the-joneses/index.html',
      ];
      const linkRe = /<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["'](\/assets\/main-[^"']+\.css)["'][^>]*>/i;
      for (const file of htmlFiles) {
        const htmlPath = resolve(__dirname, file);
        let html;
        try {
          html = readFileSync(htmlPath, 'utf-8');
        } catch {
          continue;
        }
        const match = html.match(linkRe);
        if (!match) continue;
        const cssPath = resolve(__dirname, 'dist', '.' + match[1]);
        const css = readFileSync(cssPath, 'utf-8');
        html = html.replace(match[0], `<style>${css}</style>`);
        writeFileSync(htmlPath, html);
        console.log(`[inline-css] Inlined ${match[1]} into ${file}`);
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load env from the project root with an empty prefix, so both .env files and
  // real process env vars (e.g. CI secrets) are picked up. The Bandsintown
  // credentials are re-exposed to client code below as VITE_ vars.
  const env = loadEnv(mode, __dirname, '');
  const artistId = env.BANDSINTOWN_ARTIST_ID || '';
  const appId = env.BANDSINTOWN_APP_ID || '';

  return {
    base: '/',
    root: 'src',
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/index.html'),
          'upcoming-gigs': resolve(__dirname, 'src/upcoming-gigs/index.html'),
          'book-the-joneses': resolve(__dirname, 'src/book-the-joneses/index.html'),
        },
      },
    },
    define: {
      'import.meta.env.VITE_BANDSINTOWN_ARTIST_ID': JSON.stringify(artistId),
      'import.meta.env.VITE_BANDSINTOWN_APP_ID': JSON.stringify(appId),
    },
    plugins: [prerenderGigs({ artistId, appId }), sitemapLastmod(), inlineCss()],
    server: {
      port: 0, // Dynamic port allocation
      open: false,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  };
});
