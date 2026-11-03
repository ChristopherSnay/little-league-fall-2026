import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: '.nojekyll', dest: '.' },
        { src: 'CNAME', dest: '.' },
      ],
    }),
  ],
});
