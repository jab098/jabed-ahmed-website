import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  publicDir: 'cloudflare',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: { main: 'index.html', privacy: 'privacy.html' },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Anchored to src/ so stale git worktrees under .worktrees/ are not collected
    include: ['src/**/*.test.{ts,tsx}'],
  },
  // Honour a host-assigned port (Vite ignores PORT on its own); falls back
  // to Vite's default 5173 when unset
  server: {
    port: Number(process.env.PORT) || 5173,
  },
})
