import type { Equal } from './boolean'
import type { AnyFn } from './function'

export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>
export type PrimitiveKey = string | number | symbol
export type AnyObject = Record<PrimitiveKey, any>
export type PickValue<T, K extends keyof T> = Pick<T, K>[K]
export type ValueIs<Map, K extends keyof Map, V> = Equal<PickValue<Map, K>, V>
export type AnyFnObject = Record<PrimitiveKey, AnyFn>
