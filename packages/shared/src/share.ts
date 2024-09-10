import type { PrimitiveKey } from '@monan/types'
import { isArray, isString } from './typeAssert'

export function noop(..._args: any[]): void {}

export function funcProvider<T = any>(t: T): () => T {
  return () => t
}

export function pathResolve(
  path: PrimitiveKey[] | PrimitiveKey,
): PrimitiveKey[] {
  let pathResolve: PrimitiveKey[] = []

  if (isString(path)) {
    pathResolve = String(path).split('.')
  }
  else if (isArray<PrimitiveKey[]>(path)) {
    if (path.length === 0) {
      return pathResolve
    }

    pathResolve = path
      .map((i) => {
        if (isString(i)) {
          return i.split('.')
        }
        return i
      })
      .flat()
  }

  return pathResolve
}

export function getType(source: any): string {
  return Object.prototype.toString.call(source).slice('[object '.length, -1)
}
