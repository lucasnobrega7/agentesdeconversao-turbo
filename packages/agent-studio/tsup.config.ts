import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: [
    'react', 
    'react-dom',
    'reactflow',
    '@monaco-editor/react',
    'lucide-react'
  ],
  banner: {
    js: '"use client"'
  },
  esbuildOptions(options) {
    options.jsx = 'automatic'
    options.jsxImportSource = 'react'
    options.target = 'es2020'
    options.platform = 'browser'
    return options
  }
})
