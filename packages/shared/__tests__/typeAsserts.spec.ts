import { describe, expectTypeOf, it } from 'vitest'
import { isTuple } from '..'

describe('typeAsserts', () => {
  it('isTuple is ok', () => {
    const arr: string[] | '2' = ['1']
    if (isTuple(arr)) {
      expectTypeOf(arr).toMatchTypeOf<string[]>()
    }
  })
})
