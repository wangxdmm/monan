import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import versionBump from 'bumpp'
import consola from 'consola'
import fg from 'fast-glob'
import eq from 'enquirer'
import { $$ } from './execa'
import { meta } from './meta'

const root = path.resolve(__dirname, '../')

interface Info {
  pkg: Record<string, string>
  dir: string
}

const allPkgs = fg
  .sync(['./**/package.json'], {
    cwd: root,
    dot: true,
    ignore: ['**/node_modules/**', 'package.json'],
  })
  .map((pkg) => {
    return new Proxy(
      {},
      {
        get(_target, key) {
          if (key === 'pkg') {
            return JSON.parse(fs.readFileSync(pkg, 'utf-8'))
          }

          if (key === 'dir') {
            return path.resolve(root, path.dirname(pkg))
          }
        },
      },
    ) as Info
  })

// record commits message
const commits: string[] = []

;(async () => {
  const releasePKGS: Info[] = await new (eq as any).MultiSelect({
    name: 'Release Packages',
    message: `Total: ${allPkgs.length}, Choose a project you want to release`,
    limit: 50,
    choices: [
      {
        name: 'all',
        value: allPkgs,
      },
      ...allPkgs
        .map(({ pkg }) => {
          console.log(pkg.name)
          return {
            name: pkg.name,
            value: pkg.name,
            sort: meta[pkg.name].sort,
          }
        })
        .sort((a, b) => {
          return a.sort - b.sort
        }),
    ],
    result(names: string[]) {
      if (names.includes('all')) {
        return allPkgs
      }
      else {
        return allPkgs.filter(({ pkg }) => names.includes(pkg.name))
      }
    },
  }).run()

  if (releasePKGS.length) {
    await $$`pnpm build`
  }

  for (let i = 0; i < releasePKGS.length; i++) {
    const { pkg, dir } = releasePKGS[i]
    const { name } = pkg
    try {
      const result = await versionBump({
        release: 'patch',
        tag: false,
        push: false,
        commit: false,
        cwd: dir,
        all: true,
      })
      commits.push(`${name}@${result.newVersion}`)
    }
    catch (error) {
      consola.error(error)
      process.exit(1)
    }
  }

  try {
    for (let i = 0; i < releasePKGS.length; i++) {
      const { name, version } = releasePKGS[i].pkg
      await $$({
        cwd: releasePKGS[i].dir,
      })`pnpm publish --registry=https://registry.npmjs.org/ --no-git-check`
      await $$`git add .`
      consola.success(`Success publish ${name}@${version}`)
    }
    // https://github.com/sindresorhus/execa
    // Spaces must use ${} like $`echo ${'has space'}`.
    await $$`git commit -m${`Release ${commits.join(' ')}`}`
  }
  catch (error) {
    consola.error(error)
    process.exit(1)
  }
})()
