import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
    unocss: true,
    vue: true,
    rules: {
      curly: [2, 'all'],
      'unused-imports/no-unused-imports': 'error',
      'eslint-comments/no-unlimited-disable': 'warn',
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
      "**/*.md"
    ],
  },
)
