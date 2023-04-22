import { isArray, isString } from './typeAssert'

export type UnifiedKey = string | number | symbol

export function noop(..._args: any[]): void {}

export function funcProvider<T = any>(t: T): () => T {
  return () => t
}

export function pathResolve(path: UnifiedKey[] | UnifiedKey): UnifiedKey[] {
  let pathResolve: UnifiedKey[] = []

  if (isString(path)) {
    pathResolve = String(path).split('.')
  }

  else if (isArray<UnifiedKey[]>(path)) {
    if (path.length === 0)
      return pathResolve

    pathResolve = path
      .map((i) => {
        if (isString(i))
          return i.split('.')
        return i
      }).flat()
  }

  return pathResolve
}
