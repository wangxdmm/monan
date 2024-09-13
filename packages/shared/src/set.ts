import type { PrimitiveKey } from '@monan/types'
import { pathResolve } from './share'
import { isArray, isFunction, isNumberLike, isUndef } from './typeAssert'

export type SetType = 'array' | 'object'

/**
 * Set value by path, support Symbol
 */
export function set<T = unknown>(
  obj: any,
  path: PrimitiveKey[] | PrimitiveKey,
  value: any,
  options?: {
    strict?: boolean
    typeMap?:
      | Record<string, SetType>
      | ((options: {
        cur: PrimitiveKey
        next: PrimitiveKey | undefined
        parent: any
        index: number
      }) => SetType | undefined)
  },
): [result: boolean, obj: T] {
  if (isUndef(obj)) {
    console.error('undefined null is not allowed')
    return [false, undefined as T]
  }

  const { strict = false, typeMap = {} } = options || {}
  // pathResolve(path)
  let pathOut: PrimitiveKey[]

  if (strict) {
    if (isArray(path)) {
      pathOut = path
    }
    else {
      pathOut = [path]
    }
  }
  else {
    pathOut = pathResolve(path)
  }

  if (pathOut.length === 0) {
    return obj
  }

  pathOut.reduce((cur, next, index) => {
    const isEnd = index === pathOut.length - 1
    if (isEnd) {
      return (cur[next] = value)
    }

    if (isUndef(cur[next])) {
      const useType
        = isFunction(typeMap)
          ? typeMap({
            cur: next,
            index,
            parent: cur,
            next: pathOut[index + 1],
          })
          : typeMap[index]
      return (cur[next]
        = useType
          ? useType === 'array'
            ? []
            : {}
          : isNumberLike(pathOut[index + 1])
            ? []
            : {})
    }
    else {
      return cur[next]
    }
  }, obj)

  return [true, obj]
}
