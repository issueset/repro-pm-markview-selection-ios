import path from 'node:path'
import { defineConfig } from 'vite'

// PM_VIEW=/path/to/a/prosemirror-view/checkout swaps in a locally built
// prosemirror-view (its dist/index.js) while every other prosemirror package
// still comes from this project's node_modules, so there is one instance of
// prosemirror-model.
const pmView = process.env.PM_VIEW ? path.resolve(process.env.PM_VIEW, 'docs/index.js') : null

export default defineConfig({
  resolve: {
    dedupe: ['prosemirror-model', 'prosemirror-state', 'prosemirror-transform'],
    alias: pmView ? { 'prosemirror-view': pmView } : {},
  },
  base: "./",
  build: {
    outDir: 'docs',
  },
  optimizeDeps: { noDiscovery: true, include: [] },
  server: {
    forwardConsole: { logLevels: ['log'] },
    fs: { allow: ['.', ...(pmView ? [path.dirname(pmView)] : [])] },
  },
})
