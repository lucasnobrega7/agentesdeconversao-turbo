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
    '@monaco-editor/react'
  ],
  banner: {
    js: '"use client"'
  },
  esbuildOptions(options) {
    // Otimizações para React Flow
    options.define = {
      'process.env.NODE_ENV': '"production"'
    }
  }
})
