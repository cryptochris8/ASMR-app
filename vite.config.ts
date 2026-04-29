import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    port: 5175,
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },
});
