import { describe, expect, it } from 'vitest'
import { easyTrans, get, isDef, transAttr } from '..'

describe('resutful', async () => {
  it('transAttr', () => {
    const obj: { a?: number } = {}
    const back = transAttr(obj, { a: { alterVal: 22 } })
    expect(back.a).toBe(22)
  })

  it('easyTrans', () => {
    const result = easyTrans(
      { a: 1, b: 2 },
      { c: 'a', e: ['b', () => 10] },
      { patchData: { f: 20 } },
    )
    expect(result).toEqual({
      c: 1,
      e: 10,
      f: 20,
    })

    const reulst_2 = easyTrans(
      { a: undefined, b: null, c: '', d: 0, g: '==', h: 'test' },
      {
        a: 'b',
        b: 'a',
        c: 'd',
        empty: 'c',
        g: '.',
        h: ['.', (v, s, picked) => (s.d === 0 && picked.c === 1 ? v : 20)],
      },
    )

    expect(reulst_2).toEqual({
      a: null,
      b: undefined,
      c: 0,
      empty: '',
      g: '==',
      h: 20,
    })

    const result_3 = easyTrans(
      { a: undefined, b: null, c: '', d: 0, g: '==', h: 'test' },
      { a: ['.', () => 20], b: 'b', h: '.' },
      { filter: isDef },
    )

    expect(result_3).toEqual({
      a: 20,
      h: 'test',
    })


    const result_4 = easyTrans(
      { a: undefined, b: null, c: '', d: 0, g: '==', h: 'test' },
      { a: ['.', () => 20], b: 'b', h: '.' },
      { assignRest: true },
    )

    expect(result_4).toMatchInlineSnapshot(`
      {
        "a": 20,
        "b": null,
        "c": "",
        "d": 0,
        "g": "==",
        "h": "test",
      }
    `)
  })

  it('get', () => {
    const s = Symbol('obj')
    const obj = {
      'a': {
        b: {
          c: 1,
          e: null,
          f: '',
        },
      },
      'a.b.c': 10,
      [s]: 'sym',
    }

    const arr = [1, 2, 4, null]
    ;(arr as any).__s = [2, 's']

    expect(get(obj, 'a.b.c')).toBe(1)
    expect(get(obj, 'a.b.e', 10)).toBe(10)
    expect(get(obj, ['a.b', 'c'])).toBe(1)
    expect(() => get(obj, ['a.b.c', undefined as any])).toThrowError(
      'The key you passed can not be',
    )
    expect(
      get(obj, ['a', undefined as any, 'b', 'c'], undefined, {
        skipNullable: true,
      }),
    ).toBe(1)
    expect(get(obj, 'a.b.e', 20)).toBe(20)
    expect(
      get(obj, 'a.b.e', undefined, {
        alterCondition: (_path, val, alterVal) => {
          return val === null ? val : alterVal
        },
      }),
    ).toBe(null)
    expect(get(obj, 'a.b.f', 20, v => v === '')).toBe(20)
    expect(
      get(obj, 'a.b.f', 20, {
        condition: v => v === '',
      }),
    ).toBe(20)
    expect(get(obj, 'a.b.c', 20, { strict: true })).toBe(10)
    expect(get(obj, [s], 30)).toBe('sym')
    expect(get(obj, '')).toEqual(obj)

    expect(get(arr, '1')).toBe(2)
    expect(get(arr, ['__s', 1])).toBe('s')
    expect(get(arr, '3')).toBe(undefined)
    expect(get(arr, '3', 'a')).toBe('a')
    expect(get(arr, '')).toBe(arr)
    expect(get(arr, ['   '], 1)).toBe(arr)
    expect(get(arr, [], 11)).toBe(11)
  })
})
