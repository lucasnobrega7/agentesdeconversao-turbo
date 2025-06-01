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
    'recharts',
    '@tremor/react'
  ],
  banner: {
    js: '"use client"'
  }
})
