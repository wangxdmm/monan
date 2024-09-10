import type { AnyFn, PrimitiveKey } from '@monan/types'
import { getType } from './share'

export function isArray<T>(x: any): x is Array<T> {
  return getType(x) === 'Array'
}

// TODO same to isArray
export function isTuple<T>(x: any): x is readonly T[] {
  return getType(x) === 'Array'
}

export function isString<T = string>(x: any): x is T {
  return getType(x) === 'String'
}

export function isPrimitiveKey(x: any): x is PrimitiveKey {
  return isString(x) || isSymbol(x) || isNumber(x)
}

export function isBoolean(x: any): x is boolean {
  return getType(x) === 'Boolean'
}

export function isNumber(x: any): x is number {
  return getType(x) === 'Number'
}

// async function and normal function
export function isFunction<T = AnyFn>(x: any): x is T {
  return typeof x === 'function'
}

export function isRegExp(x: any): x is RegExp {
  return getType(x) === 'RegExp'
}

export function isUndef<T = undefined | null>(x: any): x is T {
  return x === undefined || x === null
}

export function isDef<T = any>(x: T): x is NonNullable<T> {
  return x !== undefined && x !== null
}

export function isEmpty<T = null | undefined | ''>(x: any): x is T {
  return [null, undefined, ''].includes(x)
}

export function notEmpty<T>(
  x: T,
): x is T extends null | undefined | '' ? never : T {
  return !isEmpty(x)
}

export function isEmptyArray<T>(array: T[] | undefined): array is T[] {
  return isArray(array) && array.length === 0
}

export function isNonEmptyArray<T>(array?: T[] | null): array is T[] {
  return isArray(array) && array.length > 0
}

export function isObject<T = object>(x: any): x is T {
  return isDef(x) && getType(x) === 'Object'
}

export function isEmptyObject<T = object>(x: any): x is T {
  let flag = true
  for (const attr in x) {
    /* istanbul ignore else */
    // eslint-disable-next-line no-prototype-builtins
    if (x.hasOwnProperty && x.hasOwnProperty(attr)) {
      flag = false
    }
  }
  return flag
}

export function isNumberLike(x: any): x is number {
  return /^\d+$/.test(x)
}

export function isPromise<T = any>(x: any): x is Promise<T> {
  return isDef<any>(x) && isFunction(x.then) && isFunction(x.catch)
}

export function isValidArrIndex<T = number>(x: any): x is T {
  return isDef(x) && x >= 0
}

export function isServer(): boolean {
  return typeof window === 'undefined'
}

export function isSymbol<T = symbol>(x: unknown): x is T {
  return typeof x === 'symbol'
}
