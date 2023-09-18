import { resolve } from 'node:path'
import { $, type Options } from 'execa'

const options: Options = {
  cwd: resolve(__dirname, '../'),
  stdio: 'inherit',
}

export const $$ = $(options)
