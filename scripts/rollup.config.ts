import path from 'node:path'
import esbuild from 'rollup-plugin-esbuild'
import dts from 'rollup-plugin-dts'
import { PluginPure as pure } from 'rollup-plugin-pure'
import { ModuleResolutionKind } from 'typescript'
import type { OutputOptions, RollupOptions } from 'rollup'

const root = path.resolve(__dirname, '../')
const dist = path.resolve(root, 'dist')
const pluginEsbuild = esbuild({
  optimizeDeps: {
    include: ['clone', 'throttle-debounce'],
  },
  minify: true,
})
const configs: RollupOptions[] = []

const pluginPure = pure({
  functions: ['defineComponent'],
})

const output: OutputOptions[] = [
  {
    format: 'es',
    file: `${dist}/dist/index.mjs`,
  },
  {
    format: 'cjs',
    file: `${dist}/dist/index.cjs`,
  },
  {
    format: 'umd',
    file: `${dist}/dist/index.umd.js`,
    name: 'RunaFePlatformShare',
  },
  {
    format: 'umd',
    file: `${dist}/dist/index.global.js`,
    name: 'RunaFePlatformShare',
  },
]

const c: RollupOptions = {
  input: `${root}/index.ts`,
  output,
  plugins: [pluginEsbuild, pluginPure],
}
configs.push(c)

const pluginDts = dts({
  tsconfig: path.resolve(root, 'tsconfig.lib.json'),
  compilerOptions: {
    composite: false,
    moduleResolution: ModuleResolutionKind.Bundler,
    tsBuildInfoFile: '',
  },
})

configs.push({
  input: `${root}/index.ts`,
  output: {
    file: `${dist}/dist/index.d.ts`,
  },
  plugins: [pluginDts],
})

export default configs
