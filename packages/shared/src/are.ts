import * as whats from './typeAssert'

export type IsFnKeys = keyof typeof whats

export function are<T>(fn: IsFnKeys, v: unknown): v is T[] {
  return whats.isArray(v) && v.every(s => whats[fn]?.(s))
}
