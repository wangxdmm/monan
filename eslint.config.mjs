import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
    unocss: false,
    vue: false,
    rules: {
      curly: [2, 'all'],
    },
    stylistic: {
      jsx: false,
    },
  },
  {
    ignores: [
      '*.css',
      'packages/*/*.mjs',
      '**/wujie',
      '**/dist',
      '**/temp',
      '**/volar.d.ts',
      'packages/*/types',
      '**/env.d.ts',
      './types/**/*.ts',
      'eslint.config.mjs',
      '**/*.md',
    ],
  },
)
