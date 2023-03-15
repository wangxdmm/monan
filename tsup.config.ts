import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: './index.ts',
    helpers: './src/helpers/index.ts',
    http: './src/http/index.ts',
  },
  format: ['cjs', 'esm'],
  splitting: true,
  sourcemap: false,
  minify: true,
  silent: false,
  dts: process.env.DEV
    ? false
    : {
        compilerOptions: {
          composite: false,
        },
      },
  clean: true,
  tsconfig: './tsconfig.json',
})
