/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    // CRA's dev server defaulted to 3000 and start-smart.js hunted for a
    // free port; Vite already falls forward to the next free port itself.
    port: 3000,
  },
  build: {
    outDir: 'build', // keep CRA's output dir so existing deploy scripts still work
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: false,
    // TimelineComponent's suite renders the real (unmocked) react-chrono in
    // jsdom, which lacks the layout APIs it depends on -- it spins consuming
    // multiple GB of RAM rather than failing cleanly. Same exclusion that
    // previously lived in the react-app-rewired jest hook. If react-chrono
    // gets mocked there, drop this line rather than leaving it stale.
    exclude: [
      '**/node_modules/**',
      '**/src/Components/TimelineComponent/TimelineComponent.test.tsx',
    ],
  },
});
