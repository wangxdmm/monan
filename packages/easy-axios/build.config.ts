import { defineBuildConfig } from 'unbuild'
import UnpluginUnused from 'unplugin-unused/rollup'

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
        options.plugins.push(UnpluginUnused({
          ignore: ['axios'],
        }))

        options.external = []
      },
    },
  },
])
