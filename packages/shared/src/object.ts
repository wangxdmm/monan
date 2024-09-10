import type { PrimitiveKey } from '@monan/types'
import copy from 'fast-copy'
import { isArray, isDef, isFunction, isObject, isUndef } from './typeAssert'
import { get } from './get'

export type TransMap<T, K extends keyof T> = Record<
  K,
  {
    alterVal: ((val: T[K]) => T[K]) | T[K]
    when?: (val: T[K]) => boolean
  }
>

export function transAttr<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  maps: TransMap<T, K>,
): T {
  if (!isObject(obj)) {
    return obj
  }

  for (const [key, val] of Object.entries(maps)) {
    const { alterVal, when = _ => isUndef(_) } = val as any
    if (when(obj[key])) {
      obj[key as keyof T] = isFunction(alterVal) ? alterVal(obj[key]) : alterVal
    }
  }

  return obj
}

export type HashPath<T> =
  | PrimitiveKey[]
  | PrimitiveKey
  | ((v: T) => PrimitiveKey)
export function toMap<T>(arr: Array<T>, path: HashPath<T>): Record<string, T>
export function toMap<T>(
  arr: Array<T>,
  path: HashPath<T>,
  useIndex: true,
): Record<PrimitiveKey, number>
export function toMap<T>(arr: Array<T>, path: HashPath<T>, useIndex?: boolean) {
  if (!isArray(arr)) {
    return null
  }

  return arr.reduce(
    (cur, next, index) => {
      const key = isFunction(path) ? path(next) : get<PrimitiveKey>(next, path)
      if (!isDef(key)) {
        console.error(`${next} has invalid key ${key}`)
      }
      else {
        if (useIndex) {
          cur[key] = index
        }
        else {
          cur[key] = next
        }
      }
      return cur
    },
    {} as Record<PrimitiveKey, T | number>,
  )
}

export function divideArray<T>(data: T[], dep = 2) {
  if (!data || data.length === 0 || dep <= 0) {
    return []
  }

  const out: T[][] = []
  let arr: T[] = []
  for (let i = 0; i < data.length; i++) {
    const cur = data[i]
    if (arr.length < dep) {
      arr.push(cur)
      if (arr.length === dep) {
        out.push([...arr])
        arr = []
      }
      else if (i === data.length - 1 && arr.length) {
        out.push([...arr])
      }
    }
  }
  return out
}

export function squashArr<T>(arr: T[]): T[] {
  // arr = [1, 1, 2, 2, 1, 3, 3] -> [1, 2, 1, 3]
  if (!arr) {
    return []
  }

  if (arr.length <= 1) {
    return arr
  }

  return arr.reduce((cur, next) => {
    if (cur.length === 0) {
      cur.push(next)
    }
    else if (cur[cur.length - 1] !== next) {
      cur.push(next)
    }

    return cur
  }, [] as T[])
}

export const EQUAL_FLAG = '.'

export function easyTrans<
  D,
  Def extends Record<
    keyof any,
    | K1
    | [
        key: K1 | typeof EQUAL_FLAG,
        valueGetter: (
          v: D[K1],
          store: D,
          picked: Partial<Record<keyof any, any>>,
        ) => any,
    ]
    | typeof EQUAL_FLAG
  >,
  P,
  A,
  K extends keyof Def,
  K1 extends keyof D,
  UniKeys extends keyof any = P extends Record<keyof any, any>
    ? keyof P | K
    : K,
  FinalKey extends keyof any = A extends true ? UniKeys | keyof D : UniKeys,
>(
  dataStore: D,
  defs: Def,
  config?: {
    assignRest?: A
    patchData?: P
    filter?: (s: D[K1]) => boolean
  },
) {
  let pickedObj: Partial<Record<FinalKey, any>> = {}
  const { patchData, filter, assignRest } = config ?? {}

  for (const [k, condition] of Object.entries(defs)) {
    if (isArray(condition)) {
      const [key, valueGetter] = condition
      pickedObj[k] = valueGetter(
        dataStore[(key === EQUAL_FLAG ? k : key) as K1],
        dataStore,
        pickedObj,
      )
    }
    else if (condition === EQUAL_FLAG) {
      const val = dataStore[k]
      if (filter?.(val)) {
        pickedObj[k] = val
      }
      else {
        pickedObj[k] = val
      }
    }
    else {
      const val = dataStore[condition]

      if (filter?.(val) === true || filter === undefined) {
        pickedObj[k] = val
      }
    }
  }

  if (assignRest) {
    pickedObj = Object.assign({}, dataStore, pickedObj)
  }

  if (patchData) {
    Object.assign(pickedObj, patchData)
  }

  return pickedObj as Record<FinalKey, any>
}

// https://github.com/planttheidea/fast-copy/blob/master/LICENSE
export function clone<T>(x: T): T {
  return copy(x)
}
