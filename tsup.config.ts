import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: './index.ts',
    helpers: './src/helpers/index.ts',
    http: './src/http/index.ts',
  },
  globalName: 'RunaFePlatformShare',
  format: ['cjs', 'esm', 'iife'],
  splitting: true,
  sourcemap: false,
  minify: false,
  silent: false,
  dts: process.env.DEV
    ? false
    : {
        compilerOptions: {
          composite: false,
          moduleResolution: 'bundler',
        },
      },
  clean: true,
  tsconfig: './tsconfig.json',
})
