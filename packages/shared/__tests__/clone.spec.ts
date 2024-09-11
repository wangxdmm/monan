import { describe, expect, it } from 'vitest'
import { clone } from '../src'

describe('fast-copy', () => {
  it('clone is ok', () => {
    const a = {
      name: 'Jack',
      age: 10,
    }

    const aa = clone(a)

    expect(a === aa).toBeFalsy()
    expect(aa.name === a.name && a.age === aa.age).toBeTruthy()
  })
})
