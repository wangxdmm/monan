import { type FieldPath, type FieldPathArray, pathResolve } from './share'
import { isNumberPlus, isUndef } from './typeAssert'

export function set(
  obj: any,
  path: FieldPath | FieldPathArray,
  value: any,
  useType?: string,
) {
  if (isUndef(obj))
    return new Error('undefined null is not allowed')

  const pathOut = pathResolve(path)

  if (pathOut.length === 0)
    return obj

  pathOut.reduce((cur, next, index) => {
    const isEnd = index === pathOut.length - 1
    if (isEnd)
      return (cur[next] = value)

    if (isUndef(cur[next])) {
      return (cur[next] = useType
        ? useType === 'array'
          ? []
          : {}
        : isNumberPlus(pathOut[index + 1])
          ? []
          : {})
    }
    else {
      return cur[next]
    }
  }, obj)
  return obj
}
