import { defineConfig } from 'tsup'

export default defineConfig([
  // Configuração para uso como biblioteca React
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    splitting: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom'],
    banner: {
      js: '"use client"'
    }
  },
  // Configuração para widget embeddable
  {
    entry: ['src/widget.tsx'],
    format: ['iife'],
    globalName: 'AgentesChat',
    minify: true,
    clean: false,
    outExtension: () => ({
      js: '.global.js'
    }),
    noExternal: [/.*/], // Bundle tudo para o widget
    esbuildOptions(options) {
      options.define = {
        'process.env.NODE_ENV': '"production"'
      }
    }
  }
])
