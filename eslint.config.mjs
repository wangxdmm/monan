import antfu from '@antfu/eslint-config'

export default antfu(
  {
    unocss: true,
    ignores: [],
  },
  {},
  {
    // Without `files`, they are general rules for all files
    rules: {
      // curly: ['warn', 'all'],
      'unused-imports/no-unused-imports-ts': 'error',
    },
  },
)
