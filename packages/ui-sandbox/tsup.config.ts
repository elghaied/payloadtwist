import { defineConfig } from 'tsup'
import { copyFileSync, mkdirSync } from 'fs'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    '@payloadcms/ui',
    '@payloadcms/translations',
    '@payloadcms/translations/languages/en',
  ],
  banner: {
    js: "'use client'",
  },
  onSuccess: async () => {
    mkdirSync('dist/styles', { recursive: true })
    copyFileSync('src/styles/shell.css', 'dist/styles/shell.css')
  },
})
