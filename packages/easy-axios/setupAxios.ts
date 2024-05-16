import {
  get,
  isArray,
  isDef,
  isEmptyObject,
  isFunction,
  isRegExp,
} from '@monan/shared'
import type { AtLeast } from '@monan/types'
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import type {
  Config,
  DefHook,
  DynamicHandler,
  DynamicRequestConfig,
  ICodeHandlerParam,
  IHttpConfig,
  InterceptorOptionsType,
  SysError,
} from './share'
import { interParam } from './share'

export class SetupAxios<T> {
  static interParam = interParam

  config: AtLeast<IHttpConfig<T>, 'autoSetting' | 'errorFlag' | 'instance'>
  instance: AxiosInstance
  dynamicRequestConfig: Map<string, DynamicRequestConfig<T>> = new Map()
  dynamicHanlder: Map<T, DynamicHandler<T>> = new Map()
  defaultConfig = {
    autoSetting: true,
    errorFlag: 'isSysError',
    dynamicHandlerIds: [],
  }

  hooks = new Map<string, DefHook<T>>()

  constructor(config: AtLeast<IHttpConfig<T>, 'instance'>) {
    this.config = {
      ...this.defaultConfig,
      ...config,
    }
    this.instance = this.config.instance
    this.init()
  }

  init() {
    this.handleInstance(this.instance)
    if (this.config.autoSetting === true)
      this.setConfig()
  }

  // register common code handler
  registerDynamicHandler(name: T, fn: DynamicHandler<T>) {
    if (isDef(name))
      this.dynamicHanlder.set(name, fn)
  }

  registerHooks(name: string, fn: (config: Config) => Config) {
    this.hooks.set(name, fn)
  }

  getDynamicHandler(name: T) {
    if (!isDef(name)) {
      console.error(`Can not find getDynamicHandler by empty name [${name}]`)
      return
    }
    return this.dynamicHanlder.get(name)
  }

  registerDynamicRequestConfig<R = any>(
    name: string,
    fn: DynamicRequestConfig<T>['invoke'],
    config: AtLeast<DynamicRequestConfig<T, R>, 'when'> = {
      when: true,
    },
  ) {
    if (isDef(name)) {
      this.dynamicRequestConfig.set(name, {
        invoke: fn,
        ...config,
      } as DynamicRequestConfig<T, R>)
    }
  }

  getDynamicRequestConfig(name: string): DynamicRequestConfig<T>['invoke']
  getDynamicRequestConfig(name: string, all?: boolean) {
    if (!isDef(name)) {
      console.error(`Can not find dynamicRequestConfig by empty name [${name}]`)
      return
    }
    const config = this.dynamicRequestConfig.get(name)
    if (config) {
      return all
        ? (config as DynamicRequestConfig<T>)
        : (config.invoke as DynamicRequestConfig<T>['invoke'])
    }
  }

  removeDynamicRequestConfig(name: string) {
    this.dynamicRequestConfig.delete(name)
  }

  isSysError(x: any): x is SysError {
    return x?.[this.config.errorFlag] === true
  }

  getInstance() {
    return this.instance
  }

  setConfig() {
    if (this.config.transIns)
      this.config.transIns(this.instance, this)
  }

  handleInstance(instance: AxiosInstance) {
    // TODO add remove interceptors logic
    instance.interceptors.request.use(
      // TODO axios bug
      this.preRequest as (
        v: InternalAxiosRequestConfig,
      ) => InternalAxiosRequestConfig,
      this.catchError.bind(this),
      this.getInterceptorOptions('request'),
    )
    instance.interceptors.response.use(
      this.handleResponse,
      this.catchError.bind(this),
      this.getInterceptorOptions('response'),
    )
  }

  get preRequest() {
    return (config: AxiosRequestConfig) => {
      let processedConfig = config
      // dynamicly inject request configs like: token
      // TODO support async config
      this.dynamicRequestConfig.forEach((val) => {
        if (
          val.when === true
          || (isFunction(val.when) && val.when(processedConfig, this))
        )
          processedConfig = val.invoke(processedConfig)
      })
      if (this.config.request)
        processedConfig = this.config.request(processedConfig, this)

      return processedConfig
    }
  }

  getInterceptorOptions(type: InterceptorOptionsType) {
    if (this.config.interceptorOptions)
      return this.config.interceptorOptions(type, this)
  }

  get handleResponse() {
    return (result: AxiosResponse) => {
      if (this.config.response)
        result = this.config.response(result, this)

      return result
    }
  }

  async catchError(error: AxiosError): Promise<SysError> {
    const code: number = get(error, 'response.status')
    const {
      errorFlag,
      codeHandler = [
        {
          handler: ({ back }) => back,
        },
      ],
    } = this.config

    // why don't use Promise.reject? because I do not want to try catch.
    const back = {
      [errorFlag]: true,
      error,
    }

    for (let i = 0; i < codeHandler.length; i++) {
      const { on, async, handler, id } = codeHandler[i]
      if (
        !on
        || (isArray<number>(on) && on.includes(code))
        || (isRegExp(on) && on.test(String(code)))
      ) {
        if (isRegExp(on))
          on.lastIndex = 0

        const params: ICodeHandlerParam<T> = {
          code,
          error,
          ins: this.instance,
          back: Promise.resolve({ ...back, hasHandled: true }),
          rawBack: { ...back },
          httpIns: this,
        }
        if (id)
          params.dynamicHandler = this.getDynamicHandler(id)

        if (async)
          return await handler(params)

        return handler(params)
      }
    }

    // avoid try catch
    return Promise.resolve(back)
  }

  patchUrl<RequestParam = any>(urlIn, paramsIn: RequestParam, config?: Config) {
    if (paramsIn && !isEmptyObject(paramsIn)) {
      const { __M_interParam = SetupAxios.interParam } = config || {}
      const result = __M_interParam(urlIn, paramsIn, config?.__M_reverse)
      return result
    }
    return false
  }

  normalizeRequest<R = any>(
    urlIn: string,
    paramsIn?: R,
    config?: Config,
  ): {
      url: string
      dataOrParams: Partial<R>
      originUrl: string
    } {
    let url = urlIn
    let dataOrParams: Partial<R> = paramsIn || {}
    const result = this.patchUrl(urlIn, paramsIn, config)
    if (result) {
      url = result.url
      dataOrParams = result.data!
    }

    return {
      url,
      dataOrParams,
      originUrl: urlIn,
    }
  }
}
