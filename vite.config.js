import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/joneses-website/',
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
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
