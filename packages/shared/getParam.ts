import { isFunction, isObject, isPromise, isUndef } from './typeAssert'

// 验证函数
type CallsFn<T> = (
  data: T,
  dataAll?: T,
  dataRawAll?: T[],
) => boolean | Promise<boolean>

// 返回特定结构参数函数
interface funcReturn<T> {
  (...args: any[]): T
}

// fetch函数结构
type FetchType<T> = funcReturn<T> | ((...args: any[]) => Promise<T>) | T

// 标准格式结构
interface IParam<T> {
  fetch: FetchType<T>
  calls?: CallsFn<T>
  async?: boolean
}

// 返回格式
interface IBack<T> {
  valid: boolean
  param: Partial<T> // 局部参数
}

type Item<T> = IParam<T> | FetchType<T> | undefined | null

interface resolveFn<T> {
  (p: IBack<T>): void
}

export function getParam<T = object>(
  items: Item<Partial<T>>[],
  before = (dataArr: Partial<T>[]) =>
    dataArr.reduce(
      (cur: Partial<T>, next: Partial<T>) => ({ ...next, ...cur }),
      Object.create(null),
    ),
): Promise<IBack<T>> {
  type PT = Partial<T>

  const len = items.length
  let valid = true
  const dataResult: PT[] = []

  const falseResolve = (resolve: resolveFn<T>) => {
    resolve({ valid: false, param: {} })
  }

  const commonBack = (resolve: resolveFn<T>) => {
    resolve({ valid, param: before(dataResult) })
  }

  const isPartialT = (x: any): x is PT => {
    if (x.fetch === undefined && isObject(x)) return true

    return false
  }

  const validCalls = (resolve: resolveFn<T>, data: PT, calls: CallsFn<PT>) => {
    return new Promise((resolve) => {
      const result = calls(data, before(dataResult), dataResult)
      if (isPromise(result)) {
        result
          .then((val) => resolve((valid = val)))
          .catch((error) => {
            console.error(error)
            falseResolve(resolve)
          })
      } else {
        resolve((valid = result))
      }
    })
  }

  return new Promise((resolve: resolveFn<T>) => {
    const next = (step: number) => {
      const cur = items[step]
      if (step === len) commonBack(resolve)

      if (!isUndef(cur)) {
        let calls: CallsFn<PT> = () => true
        let async = false
        let fetch: FetchType<PT>

        if (isFunction(cur) || isPartialT(cur) /* 对象 */) fetch = cur
        else {
          fetch = cur.fetch

          if (cur.async) {
            async = cur.async
          }

          if (cur.calls) {
            calls = cur.calls
          }
        }

        // null undefined 直接return
        if (isUndef(fetch)) falseResolve(resolve)

        const invokeCalls = (
          resolve: resolveFn<T>,
          data: PT,
          calls: CallsFn<PT>,
        ) => {
          validCalls(resolve, data, calls).then((valid) => {
            if (valid) next(step + 1)
            else commonBack(resolve)
          })
        }

        const isAsync = (
          async: boolean,
          fetch: FetchType<PT>,
        ): fetch is (...args: any[]) => Promise<PT> => {
          if (async === true && isFunction(fetch)) return true

          return false
        }

        // 异步获取数据
        if (isAsync(async, fetch)) {
          fetch()
            .then((data: object) => {
              dataResult.push(data)
              invokeCalls(resolve, data, calls)
            })
            .catch((error: Error) => {
              console.error(error)
              falseResolve(resolve)
            })
          // function
        } else if (isFunction(fetch) && !async) {
          // 非异步
          try {
            const data = fetch()
            dataResult.push(data)
            invokeCalls(resolve, data, calls)
          } catch (error) {
            console.error(error)
            falseResolve(resolve)
          }
          // object
        } else if (isObject<PT>(fetch)) {
          dataResult.push(fetch)
          invokeCalls(resolve, fetch, calls)
        } else {
          falseResolve(resolve)
        }
      } else {
        falseResolve(resolve)
      }
    }
    next(0)
  })
}
