import { defineBuildConfig } from 'unbuild'
import UnpluginUnused from 'unplugin-unused/rollup'
import { PluginPure } from 'rollup-plugin-pure'

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
        options.plugins.push(UnpluginUnused(), PluginPure({
          functions: ['clone'],
        }))
        options.external = ['fast-copy']
      },
    },
  },
])
