import { defineConfig } from 'vite';
import { resolve } from 'path';
import prerenderGigs from './build/prerender-gigs.js';

export default defineConfig({
  base: '/joneses-website/',
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  plugins: [prerenderGigs()],
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
