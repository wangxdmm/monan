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
  includes: ['packages'],
  ignores: [],
  diffIgnores: [
    '**/env.d.ts',
    'play/*',
    'butler.config.ts',
  ],
})
