import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
    unocss: false,
    vue: true,
    rules: {
      'curly': [2, 'all'],
      'eslint-comments/no-unlimited-disable': 'warn',
      'ts/no-unused-expressions': 'off',
      'unocss/order': 'off',
      'antfu/no-top-level-await': 'off',
    },
    stylistic: {
      jsx: false,
    },
    scss: false,
  },
  {
    ignores: [],
  },
)
