import type { PrimitiveKey } from '@monan/types'
import { pathResolve } from './share'
import { isNumberLike, isUndef } from './typeAssert'

export function set(
  obj: any,
  path: PrimitiveKey[] | PrimitiveKey,
  value: any,
  useType?: string,
) {
  if (isUndef(obj)) {
    return new Error('undefined null is not allowed')
  }

  const pathOut = pathResolve(path)

  if (pathOut.length === 0) {
    return obj
  }

  pathOut.reduce((cur, next, index) => {
    const isEnd = index === pathOut.length - 1
    if (isEnd) {
      return (cur[next] = value)
    }

    if (isUndef(cur[next])) {
      return (cur[next] = useType
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
  return obj
}
