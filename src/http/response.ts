import { isArray, isObject, isString } from '../helpers'
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
      result: isSysError(res) ? false : isSuccess!(res),
      notify: () => ({}),
      response: isSysError(res) ? res.error.response! : res,
    }
    const { result } = resResult
    if (isSysError(res)) {
      // resResult.response = res.error.response;
      resResult.sysError = getBackData!(HandleEnum.SYSTEM_ERROR, res)
      resResult.message = getMessage!(HandleEnum.SYSTEM_ERROR, res)
    }
    else {
      // resResult.response = res;
      if (!result) {
        resResult.error = res.data // getBackData!(HandleEnum.FAIL, res);
        resResult.message = getMessage!(HandleEnum.FAIL, res)
      }
      else {
        resResult.backData = getBackData!(HandleEnum.SUCCESS, res)
        resResult.message = getMessage!(HandleEnum.SUCCESS, res)
        resResult.wholeData = res.data
      }
    }

    resResult.notify = (messageOrOptions) => {
      const { sysError, result } = resResult
      if (sysError && sysError.hasHandled)
        return

      const mesHash = handleEnumValues.reduce((cur, next) => {
        cur[next] = {}
        return cur
      }, {} as Record<HandleEnumKeys, MessageOptions>)
      if (isObject(messageOrOptions)) {
        handleEnumValues.forEach((mes) => {
          const cur = messageOrOptions[mes]
          if (isObject(cur))
            Object.assign(mesHash[mes], cur)
          else if (isString(cur))
            mesHash[mes].message = mes
        })
      }
      else if (isString(messageOrOptions)) {
        mesHash[HandleEnum.SUCCESS].message = messageOrOptions
      }
      else if (isArray(messageOrOptions)) {
        mesSort.forEach((k, index) => {
          if (messageOrOptions[index] !== undefined)
            mesHash[k].message = messageOrOptions[index]
        })
      }

      const getMessage = (index: HandleEnumKeys) =>
        Object.assign({ message: resResult.message }, mesHash[index])
      if (sysError) {
        http.showErrorMessageTip(getMessage(HandleEnum.SYSTEM_ERROR))
      }
      else {
        result
          ? http.showSuccessMessageTip(getMessage(HandleEnum.SUCCESS))
          : http.showErrorMessageTip(getMessage(HandleEnum.FAIL))
      }
    }

    if (!config.notificationDelay && resResult.message !== undefined)
      resResult.notify()

    return resResult
  }

  function genHandleFunc<T>(response: BatchBackType<T>) {
    return async (config?: HandleResponseConfig) => {
      return handleResponse(await response, config)
    }
  }

  http.updateHandleFunc(genHandleFunc)

  return {
    isSysError,
    handleResponse,
    genHandleFunc,
  }
}
