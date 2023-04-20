import { describe, expect, it } from 'vitest'
import { transAttr } from '..'

describe('resutful', async () => {
  it('transAttr', () => {
    const obj: { a?: number } = { }
    const back = transAttr(obj, { a: { alterVal: 22 } })
    expect(back.a).toBe(22)
  })
})
