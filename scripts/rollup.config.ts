import path from 'node:path'
import fs from 'node:fs'
import esbuild, { minify } from 'rollup-plugin-esbuild'
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
})
const configs: RollupOptions[] = []

const pluginPure = pure({
  functions: ['defineComponent'],
})

const output: OutputOptions[] = [
  {
    format: 'es',
    file: `${dist}/index.mjs`,
  },
  {
    format: 'cjs',
    file: `${dist}/index.cjs`,
  },
  {
    format: 'umd',
    file: `${dist}/index.umd.js`,
    name: 'RunaFePlatformShare',
    plugins: [minify()],
  },
  {
    format: 'umd',
    file: `${dist}/index.global.js`,
    name: 'RunaFePlatformShare',
    plugins: [minify()],
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
    file: `${dist}/index.d.ts`,
  },
  plugins: [
    pluginDts,
    {
      name: 'fix-type',
      async closeBundle() {
        let dtf = fs.readFileSync(path.resolve(`${dist}/index.d.ts`), 'utf-8')
        dtf = dtf.replace(/from 'clone'/, 'from \'./clone\'')
        dtf = dtf.replace(/from 'throttle-debounce'/, 'from \'./throttle-debounce\'')
        const dtsClone = fs.readFileSync(path.resolve(root, './node_modules/@types/clone/index.d.ts'))
        const dtsThrottleDebounce = fs.readFileSync(
          path.resolve(root, './node_modules/@types/throttle-debounce/index.d.ts'),
        )
        fs.writeFileSync(`${dist}/clone.d.ts`, dtsClone)
        fs.writeFileSync(`${dist}/throttle-debounce.d.ts`, dtsThrottleDebounce)
        fs.writeFileSync(`${dist}/index.d.ts`, dtf)
      },
    },
  ],
})

export default configs
