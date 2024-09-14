import { describe, expect, it } from 'vitest'
import { camelCase, capitalize, kebabCase, pascalCase } from '../src'

describe('string is ok', () => {
  it('pascalCase', () => {
    expect(pascalCase('toBeOrNot')).toMatchInlineSnapshot(`"ToBeOrNot"`)
  })

  it('camelCase', () => {
    expect(camelCase('toBeOrNot')).toMatchInlineSnapshot(`"toBeOrNot"`)
  })

  it('kebabCase', () => {
    expect(kebabCase('toBeOrNot')).toMatchInlineSnapshot(`"to-be-or-not"`)
  })

  it('capitalize', () => {
    expect(capitalize('hello-aaa')).toMatchInlineSnapshot(`"Hello-aaa"`)
  })
})
