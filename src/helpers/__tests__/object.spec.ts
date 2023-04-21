import { describe, expect, it } from 'vitest'
import { easyTrans, isDef, transAttr } from '..'

describe('resutful', async () => {
  it('transAttr', () => {
    const obj: { a?: number } = {}
    const back = transAttr(obj, { a: { alterVal: 22 } })
    expect(back.a).toBe(22)
  })

  it('easyTrans', () => {
    const result = easyTrans({ a: 1, b: 2 }, { c: 'a', e: ['b', () => 10] }, { patchData: { f: 20 } })
    expect(result).toEqual({
      c: 1,
      e: 10,
      f: 20,
    })

    const reulst_2 = easyTrans({ a: undefined, b: null, c: '', d: 0, g: '==', h: 'test' }, { a: 'b', b: 'a', c: 'd', empty: 'c', g: '.', h: ['.', (v, s, picked) => (s.d === 0 && picked.c === 1) ? v : 20] })

    expect(reulst_2).toEqual({
      a: null,
      b: undefined,
      c: 0,
      empty: '',
      g: '==',
      h: 20,
    })

    const result_3 = easyTrans({ a: undefined, b: null, c: '', d: 0, g: '==', h: 'test' }, { a: ['.', () => 20], b: 'b', h: '.' }, { filter: isDef })

    expect(result_3).toEqual({
      a: 20,
      h: 'test',
    })
  })
})
