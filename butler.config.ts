import { defineButlerConfig } from '@runafe/butler'

export const meta = {
  '@monan/types': {
    sort: 0,
  },
  '@monan/shared': {
    sort: 5,
  },
  '@monan/easy-axios': {
    sort: 10,
  },
}

export default defineButlerConfig({
  meta,
  ignores: ['packages/tree-shaking-test'],
  diffIgnores: ['**/env.d.ts', 'butler.config.ts'],
  registories: ['npm'],
})
