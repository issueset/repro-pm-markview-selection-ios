import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    dedupe: ['prosemirror-model', 'prosemirror-state', 'prosemirror-transform', 'prosemirror-view'],
  },
  base: "./",
  build: {
    outDir: 'docs',
  },
  optimizeDeps: { noDiscovery: true, include: [] },
  server: {
    forwardConsole: {
      logLevels: ["error", "warn", "info", "log", "debug"]
    },
  },
})
