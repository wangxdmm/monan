import { isArray, isDef, isFunction, isObject, isUndef } from './typeAssert'
import { get } from './get'

type TransMap<T, K extends keyof T> = Record<
  K,
  {
    alterVal: ((val: T[K]) => T[K]) | T[K]
    when?: (val: T[K]) => boolean
  }
>

export function transAttr<T extends Record<string, any>, K extends keyof T>(obj: T, maps: TransMap<T, K>): T {
  if (!isObject(obj))
    return obj

  for (const [key, val] of Object.entries(maps)) {
    const { alterVal, when = _ => isUndef(_) } = val as any
    if (when(obj[key]))
      obj[key as keyof T] = isFunction(alterVal) ? alterVal(obj[key]) : alterVal
  }

  return obj
}

export function toHash<T>(arr: Array<T>, path: string[] | string): Record<string, T>
export function toHash<T>(arr: Array<T>, path: string[] | string, useIndex: true): Record<string, number>
export function toHash<T>(arr: Array<T>, path: string[] | string, useIndex?: boolean) {
  if (!isArray(arr))
    return null

  return arr.reduce((cur, next, index) => {
    const key = get<string>(next, path)
    if (!isDef(key)) {
      console.error(`${next} has invalid key ${key}`)
    }
    else {
      if (useIndex)
        cur[key] = index
      else
        cur[key] = next
    }
    return cur
  }, {} as Record<string, T | number>)
}

export function divideArray<T>(data: T[], dep = 2) {
  if (!data || data.length === 0 || dep <= 0)
    return []

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
  if (!arr)
    return []

  if (arr.length <= 1)
    return arr

  return arr.reduce((cur, next) => {
    if (cur.length === 0) {
      cur.push(next)
    }
    else {
      if (cur[cur.length - 1] !== next)
        cur.push(next)
    }
    return cur
  }, [] as T[])
}
