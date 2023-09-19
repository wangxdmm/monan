import type { PrimitiveKey } from '@monan/types'
import { isArray, isFunction, isObject, isString, isUndef } from './typeAssert'
import { pathResolve } from './share'

interface GetConfig<T = any> {
  warn?: boolean
  condition?: (value: unknown) => boolean
  strict?: boolean
  emptyPathReturn?: () => T
  skipNullable?: boolean
}

export function get<T = any>(
  source: any,
  path: PrimitiveKey[] | PrimitiveKey,
  alterVal?: T,
  conditionOrConfig?: ((value: unknown) => boolean) | GetConfig<T>,
): T {
  const config: Required<GetConfig<T>> = {
    warn: true,
    strict: false,
    condition: isUndef,
    skipNullable: false,
    emptyPathReturn: () => {
      if (alterVal === undefined) {
        return source as T
      }
      else {
        if (config.warn) {
          console.warn(
            'Because your provided path is empty and alterValue is not undefined, so we use the default \'config.emptyPathReturn\' to return the alterValue, If you want to change the result please pass your own emptyPathReturn function !',
          )
        }
        return alterVal
      }
    },
  }

  if (isFunction(conditionOrConfig))
    config.condition = conditionOrConfig

  if (isObject<GetConfig>(conditionOrConfig))
    Object.assign(config, conditionOrConfig)

  if (isUndef(source)) {
    if (alterVal === undefined) {
      if (config.warn)
        console.error(`input(${source}) and alter(${alterVal}) can not be undefined together`)
    }

    return alterVal as T // source alterValue
  }

  const { condition, strict, emptyPathReturn: emptyPathBack, skipNullable } = config

  const resolvedPath: PrimitiveKey[] = strict ? (!isArray(path) ? [path] : path) : pathResolve(path)

  if (resolvedPath.length === 0)
    return emptyPathBack()

  let result = source
  for (let i = 0; i < resolvedPath.length; i++) {
    const curPath = resolvedPath[i]
    if (isString(curPath) && curPath.trim() === '')
      continue

    if (isUndef(curPath)) {
      if (!skipNullable)
        throw new Error(`The key you passed can not be ${curPath}`)
      else continue
    }

    const out = i === 0 ? source[curPath] : result[curPath]
    if (condition(out)) {
      result = alterVal
      break
    }
    else {
      result = out
    }
  }
  return result as T
}
