import fs from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import fg from 'fast-glob'
import { rimrafSync } from 'rimraf'
import type { OutputOptions, RollupOptions } from 'rollup'
import dts from 'rollup-plugin-dts'
import esbuild, { minify } from 'rollup-plugin-esbuild'
import { PluginPure as pure } from 'rollup-plugin-pure'
import pkg from 'typescript'
import { meta } from './scripts/meta'

// TODO why?
// [!] SyntaxError: Named export 'ModuleResolutionKind' not found. The requested module 'typescript' is a CommonJS module, which may not support all module.exports as named exports.
// CommonJS modules can always be imported via the default export, for example using:
// import pkg from 'typescript';
// const { ModuleResolutionKind } = pkg;

const { ModuleResolutionKind } = pkg

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

const Bundler = JSON.parse(
  fs.readFileSync('./bundler.json').toString(),
) as unknown as Record<string, Meta>
const root = resolve('./')
const configs: RollupOptions[] = []
function getBundler(dir: string): Meta {
  const pkgJson = JSON.parse(
    fs.readFileSync(join(dir, 'package.json')).toString(),
  )
  const shortName = pkgJson.name.split(namespace)[1]
  const pkg = Bundler[shortName]
  pkg.name = pkgJson.name
  pkg.rowPkg = pkgJson
  return pkg
}
const isTypePkg = (t: any): t is 'type' => t === 'type'
function collectExternals(pkg: Record<string, any>, optimizeDeps: string[]) {
  const externals = new Set()
  const { devDependencies = {}, dependencies = {}, peerDependencies = {} } = pkg

  ;[devDependencies, dependencies, peerDependencies]
    .map(map => Object.keys(map))
    .flat()
    .forEach((k) => {
      if (!optimizeDeps.includes(k)) {
        externals.add(k)
      }
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
    dtf = dtf.replace(/from 'throttle-debounce'/, 'from \'./throttle-debounce\'')

    const dtsThrottleDebounce = fs.readFileSync(
      resolve(root, './node_modules/@types/throttle-debounce/index.d.ts'),
    )
    fs.writeFileSync(
      `${sharedDist}/throttle-debounce.d.ts`,
      dtsThrottleDebounce,
    )
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
    return (
      meta[getBundler(dirname(a)).name]?.sort
      - meta[getBundler(dirname(b)).name].sort
    )
  })
  .filter((l) => {
    return (
      shouldBuildLibs.length === 0
      || shouldBuildLibs.some(lib => l.includes(lib))
    )
  })

if (buildedLibs.length === 0) {
  throw new Error('No libs !!! Please check your PKGS env !!')
}

const globals: Record<string, string> = {}

buildedLibs.forEach((lib) => {
  const meta = getBundler(dirname(lib))

  if (meta.globalName) {
    globals[meta.rowPkg.name] = meta.globalName
  }
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
    ]

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
      file: isTypePkg(meta.type)
        ? `${dir}/dist/index.d.ts`
        : `${dir}/dist/index.d.ts`,
    },
    plugins: [pluginDts, meta.name === '@monan/shared' ? fixTypesPlugin : null],
  })
})

export default configs
