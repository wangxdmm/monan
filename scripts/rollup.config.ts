import fs from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import fg from 'fast-glob'
import { rimrafSync } from 'rimraf'
import type { OutputOptions, RollupOptions } from 'rollup'
import dts from 'rollup-plugin-dts'
import esbuild, { minify } from 'rollup-plugin-esbuild'
import { PluginPure as pure } from 'rollup-plugin-pure'
import { ModuleResolutionKind } from 'typescript'
import PreBundler from './bundler.json'

const shouldBuildLibs = process.env?.PKGS?.split(',').filter(Boolean) || []
const namespace = '@monan/'

interface Meta {
  name: string
  sort: number
  type: 'lib' | 'type'
  globalName?: string
  optimizeDeps?: string[]
  globals?: string[]
  rowPkg: Record<string, any>
}

const Bundler = PreBundler as unknown as Record<string, Meta>
const root = resolve(__dirname, '../')
const configs: RollupOptions[] = []
const getBundler = (dir: string): Meta => {
  const pkgJson = JSON.parse(fs.readFileSync(join(dir, 'package.json')).toString())
  const shortName = pkgJson.name.split(namespace)[1]
  const pkg = Bundler[shortName]
  pkg.name = pkgJson.name
  pkg.rowPkg = pkgJson
  return pkg
}
const isTypePkg = (t: any): t is 'type' => t === 'type'
const collectExternals = (pkg: Record<string, any>, optimizeDeps: string[]) => {
  const externals = new Set()
  const { devDependencies = {}, dependencies = {}, peerDependencies = {} } = pkg

  ;[devDependencies, dependencies, peerDependencies]
    .map(map => Object.keys(map))
    .flat()
    .forEach((k) => {
      !optimizeDeps.includes(k) && externals.add(k)
    })

  return [...externals] as string[]
}

const pluginDts = dts({
  tsconfig: resolve(root, 'tsconfig.lib.json'),
  compilerOptions: {
    composite: false,
    moduleResolution: ModuleResolutionKind.Bundler,
    tsBuildInfoFile: '',
  },
})

const sharedDist = resolve(root, 'packages/shared/dist')
// merge clone and throttle-debounce types file to dist, which are under Appropriate LICENSE
// see packages/shared/index.ts
const fixTypesPlugin = {
  name: 'fix-type',
  async closeBundle() {
    let dtf = fs.readFileSync(resolve(`${sharedDist}/index.d.ts`), 'utf-8')
    dtf = dtf.replace(/from 'clone'/, 'from \'./clone\'')
    dtf = dtf.replace(/from 'throttle-debounce'/, 'from \'./throttle-debounce\'')
    const dtsClone = fs.readFileSync(resolve(root, './node_modules/@types/clone/index.d.ts'))
    const dtsThrottleDebounce = fs.readFileSync(resolve(root, './node_modules/@types/throttle-debounce/index.d.ts'))
    fs.writeFileSync(`${sharedDist}/clone.d.ts`, dtsClone)
    fs.writeFileSync(`${sharedDist}/throttle-debounce.d.ts`, dtsThrottleDebounce)
    fs.writeFileSync(`${sharedDist}/index.d.ts`, dtf)
  },
}

const pluginPure = pure({
  functions: ['defineComponent'],
})

const buildedLibs = fg
  .sync(['packages/*/index.ts'], {
    dot: true,
    cwd: root,
  })
  .sort((a, b) => {
    return getBundler(dirname(a)).sort - getBundler(dirname(b)).sort
  }).filter((l) => {
    return shouldBuildLibs.length === 0
    || shouldBuildLibs.some(lib => l.includes(lib))
  })

if (buildedLibs.length === 0)
  throw new Error('No libs !!! Please check your PKGS env !!')

const globals: Record<string, string> = {}

buildedLibs.forEach((lib) => {
  const meta = getBundler(dirname(lib))

  if (meta.globalName)
    globals[meta.rowPkg.name] = meta.globalName
})

buildedLibs.forEach((lib) => {
  const dir = dirname(lib)
  const meta = getBundler(dir)
  rimrafSync(`${dir}/dist`)
  if (!isTypePkg(meta.type)) {
    const pluginEsbuild = esbuild({
      optimizeDeps: {
        include: meta.optimizeDeps || [],
      },
    })

    const output: OutputOptions[] = [
      {
        format: 'es',
        file: `${dir}/dist/index.mjs`,
      },
      {
        format: 'cjs',
        file: `${dir}/dist/index.cjs`,
      },
    ]

    if (meta.globalName) {
      const o: OutputOptions = {
        format: 'umd',
        file: `${dir}/dist/index.umd.js`,
        name: meta.globalName,
        plugins: [minify({})],
        globals,
      }
      output.push(o)
    }

    const c: RollupOptions = {
      input: lib,
      output,
      external: collectExternals(meta.rowPkg, meta.optimizeDeps || []),
      plugins: [pluginEsbuild, pluginPure].filter(Boolean),
    }

    configs.push(c)
  }

  // dts
  configs.push({
    input: lib,
    external: collectExternals(meta.rowPkg, meta.optimizeDeps || []),
    output: {
      file: isTypePkg(meta.type) ? `${dir}/dist/index.d.ts` : `${dir}/dist/index.d.ts`,
    },
    plugins: [pluginDts, meta.name === '@monan/shared' ? fixTypesPlugin : null],
  })
})

export default configs
