import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  clearScreen: false,
  server: {
    port: 5173,
    host: true,
    open: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
});
