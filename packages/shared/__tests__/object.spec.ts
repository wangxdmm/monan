import { describe, expect, it } from 'vitest'
import { easyTrans, get, isDef, set, transAttr } from '../src/index'

describe('object', async () => {
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
      'dot.name.property': 12,
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
    expect(
      get(obj, 'dot.name.property', undefined, {
        strict: true,
      }),
    ).toBe(12)
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

describe('set is ok', () => {
  it('normal', () => {
    expect(set({}, 'a.b.c', 1)).toMatchInlineSnapshot(`
      [
        true,
        {
          "a": {
            "b": {
              "c": 1,
            },
          },
        },
      ]
    `)
  })

  it('array', () => {
    expect(set({}, 'a.0.c', 1)).toMatchInlineSnapshot(`
      [
        true,
        {
          "a": [
            {
              "c": 1,
            },
          ],
        },
      ]
    `)

    expect(set([], '0.a.b.0.c', 1)).toMatchInlineSnapshot(`
      [
        true,
        [
          {
            "a": {
              "b": [
                {
                  "c": 1,
                },
              ],
            },
          },
        ],
      ]
    `)
  })

  it('symbol', () => {
    expect(set({}, [Symbol('a'), '0.c.e'], 1)).toMatchInlineSnapshot(`
      [
        true,
        {
          Symbol(a): [
            {
              "c": {
                "e": 1,
              },
            },
          ],
        },
      ]
    `)
  })

  it('strict is ok', () => {
    expect(set({}, 'a.b.c', 1, { strict: true })).toMatchInlineSnapshot(`
      [
        true,
        {
          "a.b.c": 1,
        },
      ]
    `)
  })

  it('type maps is ok', () => {
    expect(
      set({}, 'a.2.b.0', 1, {
        typeMap: {
          0: 'object',
        },
      }),
    ).toMatchInlineSnapshot(`
      [
        true,
        {
          "a": {
            "2": {
              "b": [
                1,
              ],
            },
          },
        },
      ]
    `)
  })

  it('type maps as function is ok', () => {
    expect(
      set({}, 'a.2.b.0', 1, {
        typeMap: ({ cur }) => {
          if (cur === 'a' || cur === 'b') {
            return 'object'
          }
        },
      }),
    ).toMatchInlineSnapshot(`
      [
        true,
        {
          "a": {
            "2": {
              "b": {
                "0": 1,
              },
            },
          },
        },
      ]
    `)
  })

  it('empty is ok', () => {
    expect(set(undefined, 'a.b.c', 1)).toMatchInlineSnapshot(`
      [
        false,
        undefined,
      ]
    `)
  })

  it('array path is ok', () => {
    expect(
      set({}, ['a', 1, 'b', 0], 1, {
        typeMap: ({ index }) => {
          if (index === 0) {
            return 'object'
          }
        },
      }),
    ).toMatchInlineSnapshot(`
      [
        true,
        {
          "a": {
            "1": {
              "b": [
                1,
              ],
            },
          },
        },
      ]
    `)
  })
})
