import fs from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { $$ } from './execa'

const root = resolve(__dirname, '..')
const rcFile = resolve(root, './.env-cmdrc')
const builds = process.argv.slice(2)
const cmdRcFile = JSON.parse(fs.readFileSync(rcFile, 'utf-8'))
const isWatch = builds.includes('-w')
const isDebug = builds.includes('--debug')
const isBuildAll = builds.length === 0

async function work(
  hooks: {
    before?: (...args: any[]) => void
    doTasks?: (...args: any[]) => Promise<void>
  } = {},
) {
  const { before, doTasks: task } = hooks
  cmdRcFile.build.DEBUG = isDebug
  if (before)
    before()
  fs.writeFileSync(rcFile, JSON.stringify(cmdRcFile, null, 2))
  if (task)
    await task()
}

async function runRollup(isWatch: boolean) {
  if (isWatch)
    await $$`pnpm exec env-cmd -e build rollup -c rollup.config.ts --configPlugin rollup-plugin-esbuild -w`

  else
    await $$`pnpm exec env-cmd -e build rollup -c rollup.config.ts --configPlugin rollup-plugin-esbuild`
}

(async () => {
  await work({
    before: () => {
      cmdRcFile.build.PRE = false
      if (!isBuildAll)
        cmdRcFile.build.PKGS = builds

      else
        cmdRcFile.build.PKGS = []
    },
    doTasks: async () => {
      await runRollup(isWatch)
    },
  })
})()
