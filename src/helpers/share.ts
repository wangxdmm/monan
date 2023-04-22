import { isArray, isString } from './typeAssert'

export type ObjIndex = string | number | symbol

export function noop(..._args: any[]): void {}

export function genAnyBackFunc<T = any>(t: T): () => T {
  return () => t
}

export function pathResolve(path: ObjIndex[] | ObjIndex): ObjIndex[] {
  let pathResolve: ObjIndex[] = []

  if (isString(path)) {
    pathResolve = String(path).split('.')
  }

  else if (isArray<ObjIndex[]>(path)) {
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
