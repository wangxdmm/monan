import { isArray, isObject, isString } from '@monan/shared'
import type { AnyFn } from '@monan/types'
import type { Restful } from './restful'
import type {
  BatchBackType,
  HandleEnumKeys,
  HandleResponseConfig,
  MessageOptions,
  ResponseResult,
  SysError,
  UnionBack,
} from './share'
import { HandleEnum, handleEnumValues } from './share'

export const mesSort = [
  HandleEnum.SUCCESS,
  HandleEnum.FAIL,
  HandleEnum.SYSTEM_ERROR,
]

export function genHandleResponse<T>(http: Restful<T>) {
  function isSysError<T = any>(x: any): x is SysError<T> {
    return http.isSysError(x)
  }

  function handleResponse<T extends UnionBack<any>>(
    res: T,
    configIn?: HandleResponseConfig,
  ): ResponseResult<T> {
    const config: HandleResponseConfig = Object.assign(
      {
        isSuccess: http.defaultIsSuccess,
        getBackData: http.defaultGetBackData,
        getMessage: http.defaualtGetMessage,
      } as Partial<HandleResponseConfig>,
      configIn || {},
    )
    const { getBackData, getMessage, isSuccess } = config
    const resResult: ResponseResult<T> = {
      // TODO improve type
      skip: (res as any)?.__M_skip === true,
      result: isSysError(res) ? false : !!isSuccess?.(res),
      notify: () => ({}),
      response: isSysError(res) ? res.error.response! : res,
    }
    const { result } = resResult
    if (isSysError(res)) {
      // resResult.response = res.error.response;
      resResult.sysError = getBackData?.({
        type: HandleEnum.SYSTEM_ERROR,
        res,
        http,
      }) as ResponseResult<T>['sysError']
      resResult.message = getMessage?.({
        type: HandleEnum.SYSTEM_ERROR,
        res,
        http,
      })
    }
    else {
      // resResult.response = res;
      if (!result) {
        resResult.error = res.data // getBackData!(HandleEnum.FAIL, res);
        resResult.message = getMessage?.({
          type: HandleEnum.FAIL,
          res,
          http,
        })
      }
      else {
        resResult.backData = getBackData?.({
          type: HandleEnum.SUCCESS,
          res,
          http,
        }) as ResponseResult<T>['backData']
        resResult.message = getMessage?.({
          type: HandleEnum.SUCCESS,
          res,
          http,
        })
        resResult.wholeData = res.data
      }
    }

    resResult.notify = (messageOrOptions) => {
      const { sysError, result } = resResult
      if (sysError && sysError.hasHandled) {
        return
      }

      const mesHash = handleEnumValues.reduce(
        (cur, next) => {
          cur[next] = {}
          return cur
        },
        {} as Record<HandleEnumKeys, MessageOptions>,
      )
      if (isObject(messageOrOptions)) {
        handleEnumValues.forEach((mes) => {
          const cur = messageOrOptions[mes]
          if (isObject(cur)) {
            Object.assign(mesHash[mes], cur)
          }
          else if (isString(cur)) {
            mesHash[mes].message = mes
          }
        })
      }
      else if (isString(messageOrOptions)) {
        mesHash[HandleEnum.SUCCESS].message = messageOrOptions
      }
      else if (isArray(messageOrOptions)) {
        mesSort.forEach((k, index) => {
          if (messageOrOptions[index] !== undefined) {
            mesHash[k].message = messageOrOptions[index]
          }
        })
      }

      const getMessage = (index: HandleEnumKeys) =>
        Object.assign({ message: resResult.message }, mesHash[index])
      if (isSysError(res)) {
        http.showErrorMessageTip(getMessage(HandleEnum.SYSTEM_ERROR), {
          response: res.error.response,
        })
      }
      else {
        if (result) {
          http.showSuccessMessageTip(getMessage(HandleEnum.SUCCESS), {
            response: res,
          })
        }
        else {
          http.showErrorMessageTip(getMessage(HandleEnum.FAIL), {
            response: res,
          })
        }
      }
    }

    // Note: the result of getMessage should not be the condition to determine whether to notify, the only things getMessage works is to get a valid message by user config
    // 1. notificationDelay is to determine when to notify success or fail message, and default is false
    // 2. showServerSuccessMessage is to determine whether to notify success message, and  default is false
    // 3. if result is false, we should always notify, and the only way to stub it is set notificationDelay to true
    if (!config.notificationDelay) {
      if (config.showServerSuccessMessage || !resResult.result) {
        resResult.notify()
      }
    }

    return resResult
  }

  function genHandleFunc<T>(response: () => BatchBackType<T>, after?: AnyFn) {
    return (config?: HandleResponseConfig) =>
      new Promise<ResponseResult<UnionBack<T>>>((resolve) => {
        response().then((res) => {
          resolve(handleResponse(res, config))
          after?.()
        })
      })
  }

  http.updateHandleFunc(genHandleFunc)

  return {
    isSysError,
    handleResponse,
    genHandleFunc,
  }
}
