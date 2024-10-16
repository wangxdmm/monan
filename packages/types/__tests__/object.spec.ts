import { describe, expectTypeOf, it } from 'vitest'
import type { AtLeast, PickValue, ValueIs } from '../src/object'

describe('type Object is ok', () => {
  it('pickValue, ValueIs is ok', () => {
    interface Test {
      a: string
      b: number
      c?: boolean
    }

    expectTypeOf<PickValue<Test, 'c'>>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<PickValue<Test, 'a' | 'b'>>().toEqualTypeOf<string | number>()

    expectTypeOf<ValueIs<Test, 'a', string>>().toEqualTypeOf<true>()
    expectTypeOf<ValueIs<Test, 'c', boolean>>().toEqualTypeOf<false>()
  })

  it('atLeast is ok', () => {
    interface Test {
      a: string
      b: number
      c?: boolean
    }

    expectTypeOf<{
      a: string
    }>().toMatchTypeOf<AtLeast<Test, 'a'>>()

    expectTypeOf<{
      a: string
      b: number
    }>().toMatchTypeOf<AtLeast<Test, 'a'>>()

    expectTypeOf<{
      a?: string
    }>().not.toMatchTypeOf<AtLeast<Test, 'a'>>()
  })
})
