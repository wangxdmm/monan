import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig([
  {
    entries: ['./src/index.ts'],
    clean: true,
    declaration: false,
    rollup: {
      esbuild: {
        minify: false,
      },
    },
    hooks: {
      'rollup:options': (_, options) => {
        options.external = []
      },
    },
  },
])
