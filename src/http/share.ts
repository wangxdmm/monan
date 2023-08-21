import type {
  AxiosError,
  AxiosInstance,
  AxiosInterceptorOptions,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from 'axios'
import type { Equal } from '../helpers'
import type { SetupAxios } from './setupAxios'

export const ContentTypeKey = 'Content-Type'

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

export type HandleEnumKeys = keyof typeof HandleEnum
export const handleEnumValues = Object.values(HandleEnum)

export type DynamicHandlerIds = 'tokenOutdate'

export interface ICodeHandlerParam<T> {
  code: number | string
  error: AxiosError
  ins: AxiosInstance | AxiosInstance[]
  back: Promise<SysError>
  rowBack: SysError
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
    [ContentTypeKey]: ContentTypeEnum[type],
  }
}

export interface IHttpConfig<T> {
  instance: AxiosInstance
  autoSetting: boolean
  errorFlag: string
  codeHandler: ICodeHandler<T>[]
  request(config: AxiosRequestConfig, ins: SetupAxios<T>): AxiosRequestConfig
  interceptorOptions(type: InterceptorOptionsType, ins: SetupAxios<T>): AxiosInterceptorOptions
  response(res: AxiosResponse, ins: SetupAxios<T>): AxiosResponse
  transIns(ins: AxiosInstance, setUpIns: SetupAxios<T>): void
}

export interface DynamicRequestConfig<T, R = any> {
  invoke: (config: AxiosRequestConfig<R>) => AxiosRequestConfig<R>
  when: ((config: AxiosRequestConfig, ins: SetupAxios<T>) => boolean) | boolean
}

export type InterceptorOptionsType = 'request' | 'response'

export type GetHandlerIds<T> = T extends readonly [{ id: infer K }, ...infer Rest] ? K | GetHandlerIds<Rest> : never

export type DynamicHandler<T> = (params: Parameters<ICodeHandler<T>['handler']>[0]) => any

export type FetchFunc<T = object, K = any> = (
  data?: T,
  reserve?: boolean,
  others?: object
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
  __R_reverse?: boolean
  __R_interParam?: <T>(url: string, dataIn: T, reverse?: boolean) => { url: string; data: Partial<T> }
}

export type MessageTip = (messageOrOptions?: string | Partial<MessageOptions>, other?: { response?: AxiosResponse }) => void

/**
 * You can define your own MessageOptions in your own project: like element-plus.MessageOptions
 * --------------------------------------------------------------------------------------------------------
 * import type { MessageOptions } from 'element-plus';
 *
 * declare module '@runafe/platform-share' {
 *   export interface MessageOptions  extends OtherMessageOptions{}
 * }
 * --------------------------------------------------------------------------------------------------------
 */
export interface MessageOptions {
  message?: string
}

export interface defineAPI<Id, DataOrDefinition = any, Response = any, _a = any> {
  id: Id
  dataOrDefinition: DataOrDefinition
  response: (<T>(_p: T) => Response) | Response
}

export interface LabelDef {
  method: Method
  url: string
  id: string
  meta?: {
    noArgs?: boolean // no arguments
    contentType?: ContentTypeEnum
    // make userInputData as axios.params
    // `params` are the URL parameters to be sent with the request
    // if you want to use params and body together , you can parse config{data: Data}
    // Must be a plain object or a URLSearchParams object
    makeInputAsParams?: boolean
    timeout?: string
    responseType?: 'arraybuffer' | 'document' | 'json' | 'text' | 'stream' | 'blob'
  }
}

// You can define your own Response in your own project like:
/*
 declare module '@runafe/platform-share' {
    export interface Response<T = unknown, S = boolean> {
      code: number;
      data?: T;
      message?: string;
      success: S;
      total?: number;
    }
 }
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
  __R_response?: true
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
  result: boolean
  // 兼容老版本backData命名 = wholeData.data
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
    | [success?: string, fail?: string, sysError?: string]
  ) => void
}

export interface HandleResponseConfig {
  notificationDelay?: boolean
  // default strategies are:
  // 1. if result is sysError or is not success , showErrorMessageTip show automatically
  // 2. sometime server always return a success message, for common use, we don't need to show it
  showServerSuccessMessage?: boolean
  isSuccess?: (res: AxiosResponse<any>) => boolean
  getBackData?: (type: HandleEnum, res: UnionBack<any>) => any
  getMessage?: (type: HandleEnum, res: UnionBack<any>) => any
}

export const PlainKey = Symbol('Plain')
export type SymbolPlainKey = typeof PlainKey

export interface UsePrimitiveType<T> {
  [PlainKey]: T
}

export interface DefaultStrategies<D = any> {
  isSuccess: (res: AxiosResponse<D>) => boolean
  getBackData: (type: HandleEnum, res: AxiosResponse<D>) => D
  getMessage: (type: HandleEnum, res: AxiosResponse<D>) => string | undefined
  showErrorMessageTip: MessageTip
  showSuccessMessageTip: MessageTip
}

export type WrapResponse<T> = T extends ServerDefinedResponse<unknown>
  ? T
  : T extends UsePrimitiveType<infer P>
    ? P
    : ServerDefinedResponse<T>

export type DefineResponseResult<T> = (
  config?: HandleResponseConfig
) => Promise<ResponseResult<UnionBack<WrapResponse<T>>>>

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

// export type ComputedResponse<T, Response> = Response extends
export type ExtractAPI<T, R extends {} = {}> = T extends [infer F, ...infer Rest]
  ? F extends defineAPI<infer Id, infer DataOrDefinition, infer Response>
    ? Id extends string
      ? DataOrDefinition extends (...args: any[]) => any
        ? ExtractAPI<Rest, { [k in Id | keyof R]: k extends Id ? DataOrDefinition : k extends keyof R ? R[k] : never }>
        : ExtractAPI<
            Rest,
            {
              [k in Id | keyof R]: k extends Id
                ? <const T extends DefineRequestFuncParams<DataOrDefinition>>(...p: T) => DefineResponseResult<Response>
                : k extends keyof R
                  ? R[k]
                  : never
            }
          >
      : ExtractAPI<Rest, R> // skip
    : F
  : R // return Result

export type GenHandleFunc = <T>(
  response: () => BatchBackType<T>
) => (config?: HandleResponseConfig) => Promise<ResponseResult<UnionBack<T>>>
