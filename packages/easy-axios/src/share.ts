import type {
  AxiosError,
  AxiosInstance,
  AxiosInterceptorOptions,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from 'axios'
import type { AnyFn, Equal } from '@monan/types'
import { isDef, isObject } from '@monan/shared'
import type { SetupAxios } from './setupAxios'
import type { Restful } from './restful'

export const monanSymbol = Symbol('__monan_axios__')
export const ContentTypeKey = 'Content-Type'

export type DefHook<T> = (
  config: Config,
  ins: SetupAxios<T>,
  options?: {
    requestToken: string
  },
) => Config

export function interParam<T, K extends keyof T>(
  urlIn: string,
  dataIn: T,
  reserve = false,
) {
  let url = urlIn
  const data = isObject(dataIn) ? { ...dataIn } : dataIn
  const matchs = url.match(/\{([^/.]+)\}/g)
  if (matchs?.length) {
    matchs.forEach((param) => {
      const key: K = param.replace(/[{}]/g, '') as K
      if (isDef(data[key])) {
        url = url.replace(param, String(data[key]))
        if (!reserve) {
          delete data[key]
        }
      }
      else {
        console.error(
          `[easyAxios/interParam]: ${key as string} is ${data[key]}, Please check.`,
        )
      }
    })
  }
  return { url, data }
}

export enum ContentTypeEnum {
  JSON = 'application/json',
  FORM = 'application/x-www-form-urlencoded',
  MULTIPART = 'multipart/form-data',
}

export enum HandleEnum {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
}

export function isSuccess(x: HandleEnum): x is HandleEnum.SUCCESS {
  return x === HandleEnum.SUCCESS
}

export function isFail(x: HandleEnum): x is HandleEnum.FAIL {
  return x === HandleEnum.FAIL
}

export function isSystemError(x: HandleEnum): x is HandleEnum.SYSTEM_ERROR {
  return x === HandleEnum.SYSTEM_ERROR
}

export type HandleEnumKeys = keyof typeof HandleEnum
export const handleEnumValues = Object.values(HandleEnum)

export type DynamicHandlerIds = 'tokenOutdate'

export interface ICodeHandlerParam<T> {
  code: number | string
  error: AxiosError
  ins: AxiosInstance | AxiosInstance[]
  back: Promise<SysError>
  rawBack: SysError
  httpIns: SetupAxios<T>
  dynamicHandler?: ICodeHandler<T>['handler']
}

export interface ICodeHandler<T> {
  id?: T
  on?: RegExp | number[]
  async?: boolean
  handler: (back: ICodeHandlerParam<T>) => any
}

export function genContentHeader(type: ContentTypeEnum) {
  return {
    [ContentTypeKey]: (ContentTypeEnum as any)[type],
  }
}

export interface IHttpConfig<T> {
  instance: AxiosInstance
  autoSetting: boolean
  errorFlag: string
  single: boolean
  salt: (config: Config) => string
  codeHandler: ICodeHandler<T>[]
  request: (
    config: AxiosRequestConfig,
    ins: SetupAxios<T>,
  ) => AxiosRequestConfig
  interceptorOptions: (
    type: InterceptorOptionsType,
    ins: SetupAxios<T>,
  ) => AxiosInterceptorOptions
  response: (res: AxiosResponse, ins: SetupAxios<T>) => AxiosResponse
  transIns: (ins: AxiosInstance, setUpIns: SetupAxios<T>) => void
}

export interface DynamicRequestConfig<T, R = any> {
  invoke: (config: AxiosRequestConfig<R>) => AxiosRequestConfig<R>
  when: ((config: AxiosRequestConfig, ins: SetupAxios<T>) => boolean) | boolean
}

export type InterceptorOptionsType = 'request' | 'response'

export type GetHandlerIds<T> = T extends readonly [
  { id: infer K },
  ...infer Rest,
]
  ? K | GetHandlerIds<Rest>
  : never

export type DynamicHandler<T> = (
  params: Parameters<ICodeHandler<T>['handler']>[0],
) => any

export type FetchFunc<T = object, K = any> = (
  data?: T,
  reserve?: boolean,
  others?: object,
) => Promise<AxiosResponse<K> | SysError>

export type IRestResult = Record<string, FetchFunc>
export type UnionBack<T> = AxiosResponse<T, any> | SysError<T>
export type BatchBackType<T> = Promise<UnionBack<T>>
// error response
export interface SysError<T = any> {
  error: AxiosError<T>
  isSysError?: boolean
  hasHandled?: boolean
  [index: string]: boolean | AxiosError | undefined
}

export type Config<D = any> = AxiosRequestConfig<D> & {
  __M_reverse?: boolean
  __M_spy?: AnyFn
  monanOptions?: {
    single?: boolean
    abort?: boolean
  }
  __M_interParam?: <T>(
    url: string,
    dataIn: T,
    reverse?: boolean,
  ) => { url: string, data: Partial<T> }
}

export type MessageTip = (
  messageOrOptions?: string | Partial<MessageOptions>,
  other?: { response?: AxiosResponse },
) => void

/**
 * You can define your own MessageOptions in your own project eg:
 * element-plus.MessageOptions
 *
 * ```ts
 * import type { MessageOptions } from 'element-plus'
 *
 * declare module '@monan/platform-share' {
 *   export interface MessageOptions extends OtherMessageOptions {}
 * }
 * ```
 */
export interface MessageOptions {
  message?: string
}

export interface defineAPI<
  Id,
  DataOrDefinition = any,
  Response = any,
  _a = any,
> {
  id: Id
  dataOrDefinition: DataOrDefinition
  response: (<T>(_p: T) => Response) | Response
}

export interface LabelDef {
  method: Method
  url: string
  id: string
  meta?: {
    hooks?: string[]
    noArgs?: boolean // no arguments
    contentType?: ContentTypeEnum
    // make userInputData as axios.params
    // `params` are the URL parameters to be sent with the request
    // if you want to use params and body together , you can parse config{data: Data}
    // Must be a plain object or a URLSearchParams object
    makeInputAsParams?: boolean
    timeout?: string
    responseType?:
      | 'arraybuffer'
      | 'document'
      | 'json'
      | 'text'
      | 'stream'
      | 'blob'
  }
}

/**
 * You can define your own Response in your own project like:
 *
 * ```ts
 * declare module '@monan/platform-share' {
 *   export interface Response<T = unknown, S = boolean> {
 *     code: number
 *     data?: T
 *     message?: string
 *     success: S
 *     total?: number
 *   }
 * }
 * ```
 */

export interface ServerDefinedResponse<
  // eslint-disable-next-line unused-imports/no-unused-vars
  T = unknown,
  // eslint-disable-next-line unused-imports/no-unused-vars
  S extends boolean | string | number = boolean,
> {
  // code: number;
  // data?: T;
  // message?: string;
  // success: S;
  // total?: number;
  // [index: string]: unknown;
  __M_response?: true
}

export interface ResponseResult<
  T,
  D = T extends AxiosResponse<infer K>
    ? K extends ServerDefinedResponse<infer R>
      ? Equal<R, unknown> extends true
        ? K
        : R
      : K
    : never,
  R = T extends AxiosResponse<infer K> ? K : never,
> {
  skip?: boolean
  result: boolean
  backData?: D
  // server response = result && response
  wholeData?: R
  error?: ServerDefinedResponse<D, false>
  sysError?: T extends SysError ? T : never
  // axios Response
  response: AxiosResponse<R>
  message?: string
  notify: (
    mes?:
      | Partial<Record<HandleEnumKeys, Partial<MessageOptions>>>
      | string
      | [success?: string, fail?: string, sysError?: string],
  ) => void
}

export interface HandleResponseConfig<D = ServerDefinedResponse> {
  notificationDelay?: boolean
  // default strategies are:
  // 1. if result is sysError or is not success , showErrorMessageTip show automatically
  // 2. sometime server always return a success message, for common use, we don't need to show it
  showServerSuccessMessage?: boolean
  isSuccess?: (res: AxiosResponse<D>) => boolean
  getBackData?: (options: {
    type: HandleEnum
    res: UnionBack<D>
    http: Restful<any>
  }) => unknown
  getMessage?: (options: {
    type: HandleEnum
    res: UnionBack<D>
    http: Restful<any>
  }) => string | undefined
}

export const PlainKey = Symbol('Plain')
export type SymbolPlainKey = typeof PlainKey

export interface UsePrimitiveType<T> {
  [PlainKey]: T
}

export interface DefaultStrategies<D = any>
  extends Required<
    Pick<HandleResponseConfig<D>, 'isSuccess' | 'getBackData' | 'getMessage'>
  > {
  showErrorMessageTip: MessageTip
  showSuccessMessageTip: MessageTip
}

export type WrapResponse<T> =
  T extends ServerDefinedResponse<unknown>
    ? T
    : T extends UsePrimitiveType<infer P>
      ? P
      : ServerDefinedResponse<T>

export interface DefineResponseResult<T> {
  (
    config?: HandleResponseConfig,
  ): Promise<ResponseResult<UnionBack<WrapResponse<T>>>>
  token: string
}

export interface MarkAsPartial<T> {
  value: T
}

export type DefineRequestFuncParams<Data> = Data extends [infer Params, infer D]
  ? [Params] extends [void]
      ? [D] extends [void]
          ? [config?: Config]
          : [data: D, config?: Config<D>]
      : [params: Params, config?: Config<D>]
  : Data extends [infer P]
    ? [params: P, config?: Config]
    : [Data] extends [void]
        ? [config?: Config]
        : [data: Data, config?: Config]

export interface CombinedApi<T extends AnyFn> {
  is: typeof monanSymbol
  config: Config
  (...args: Parameters<T>): ReturnType<T>
}

// if tuple's length more than 50, ts will give warning
// export type ComputedResponse<T, Response> = Response extends
export type ExtractAPI<T, R extends object = object> = T extends [
  infer F,
  ...infer Rest,
]
  ? F extends defineAPI<infer Id, infer DataOrDefinition, infer Response>
    ? Id extends string
      ? DataOrDefinition extends (...args: any[]) => any
        ? ExtractAPI<
          Rest,
          {
            [k in Id | keyof R]: k extends Id
              ? DataOrDefinition
              : k extends keyof R
                ? R[k]
                : never
          }
        >
        : ExtractAPI<
          Rest,
          {
            [k in Id | keyof R]: k extends Id
              ? CombinedApi<
                <const T extends DefineRequestFuncParams<DataOrDefinition>>(
                  ...p: T
                ) => DefineResponseResult<Response>
              >
              : k extends keyof R
                ? R[k]
                : never
          }
        >
      : ExtractAPI<Rest, R> // skip
    : F
  : R // return Result

export type GenHandleFunc = <T>(
  response: {
    (): BatchBackType<T>
    token: string
  },
  after?: AnyFn,
) => (config?: HandleResponseConfig) => Promise<ResponseResult<UnionBack<T>>>
