import type { Method } from 'axios'
import { get, isDef, isString, noop, set } from '@monan/shared'
import { hash } from 'ohash'
import { SetupAxios } from './setupAxios'
import type {
  Config,
  DefaultStrategies,
  DefineResponseResult,
  ExtractAPI,
  GenHandleFunc,
  LabelDef,
  ServerDefinedResponse,
  defineAPI,
} from './share'
import { ContentTypeEnum, ContentTypeKey, monanSymbol } from './share'

export const WHEN_INJECT_PARAM_NO_ID_ERROR_DES
  = 'When your def match /a/b/{something},you should specificly give a alterName by use /a/b/{something}->alterName'

export class Restful<T> extends SetupAxios<T> {
  genHandleFunc!: GenHandleFunc
  defaultStrategies: Partial<DefaultStrategies> = {}
  requestSet = new Set<string>()
  abortControllerMap = new Map<string, AbortController>()

  abort(token: string) {
    this.abortControllerMap.get(token)?.abort()
  }

  clearCache() {
    const keys = [...this.requestSet]
    this.requestSet.clear()

    keys.forEach((s) => {
      this.abortControllerMap.get(s)?.abort()
    })

    this.abortControllerMap.clear()
  }

  createDefaultStrategies<D = ServerDefinedResponse>(
    strategiesCreator: (ins: this) => Partial<DefaultStrategies<D>>,
  ) {
    Object.assign(this.defaultStrategies, strategiesCreator(this))
  }

  get defaultIsSuccess() {
    return this.defaultStrategies.isSuccess || noop
  }

  get defaultGetBackData() {
    return this.defaultStrategies.getBackData || noop
  }

  get defaualtGetMessage() {
    return this.defaultStrategies.getMessage || noop
  }

  get showErrorMessageTip() {
    return this.defaultStrategies.showErrorMessageTip || noop
  }

  get showSuccessMessageTip() {
    return this.defaultStrategies.showSuccessMessageTip || noop
  }

  updateHandleFunc(fn: GenHandleFunc) {
    this.genHandleFunc = fn
  }

  parseDef(def: string): LabelDef | undefined {
    const valueDiv = '->'
    const meta: LabelDef['meta'] = {}

    let [method, url, metaStr] = def.split('::')
    let id = ''
    if (!method) {
      throw new Error(
        `${def} must have method: please check https://github.com/axios/axios`,
      )
    }
    method = method.toLowerCase().trim()
    // get() -> use empty args func
    if (method.includes('(')) {
      method = method.slice(0, -2)
      meta.noArgs = true
    }

    if (url) {
      ;[url, id] = url.split(valueDiv)
      // eslint-disable-next-line ts/no-unused-expressions
      url && (url = url.trim())
      if (url.slice(-1) === '?') {
        meta.makeInputAsParams = true
        url = url.slice(0, -1)
      }

      if (!id) {
        let mayBeId = url.split('/').pop()
        // eslint-disable-next-line no-cond-assign
        if ((mayBeId = mayBeId?.trim())) {
          // eslint-disable-next-line regexp/no-unused-capturing-group, regexp/no-useless-flag
          const injectParamReg = /\{([^/.]+)\}/g
          if (!injectParamReg.test(mayBeId)) {
            id = mayBeId
          }
          else {
            throw new Error(WHEN_INJECT_PARAM_NO_ID_ERROR_DES)
          }
        }
      }

      if (!id) {
        throw new Error(
          `We default use last word in path as id of the request, 
          like: "a/b/c" we will use c as id, or "a/b/c->alterName" we will use alterName as id,
          but there is nothing in ${def}, Please check the rule.`,
        )
      }
    }

    if (metaStr) {
      metaStr.split(',').forEach((m) => {
        const [k, v = true] = m.split(valueDiv)
        meta[k as (keyof NonNullable<LabelDef['meta']>)] = v as any
        if (k === 'hooks' && isString(v) && isDef(v)) {
          meta[k] = v.split('=>')
        }
        else {
          meta.hooks = []
        }
      })
    }

    // `data` is the data to be sent as the request body
    // Only applicable for request methods 'PUT', 'POST', 'DELETE , and 'PATCH'
    // https://github.com/axios/axios
    if (!['put', 'post', 'delete', 'patch'].includes(method)) {
      meta.makeInputAsParams = true
    }

    return {
      id,
      url,
      method: method as Method,
      meta,
    }
  }

  patchConfigByMeta(
    userInputData: unknown,
    config: Config,
    meta: LabelDef['meta'],
  ): Config {
    const configed: Config = config || {}
    if (meta) {
      let contentType
      const { timeout, makeInputAsParams: params, responseType } = meta

      if (meta.contentType) {
        contentType = meta.contentType.toUpperCase()
      }

      if (
        contentType
        && !get(configed, ['headers', ContentTypeKey])
        && (ContentTypeEnum as any)[contentType]
      ) {
        set(configed, ['headers', ContentTypeKey], (ContentTypeEnum as any)[contentType])
      }

      if (params && !configed.params) {
        set(configed, 'params', userInputData)
      }

      // default userInputData is set to config.data
      if (!params && !configed.data) {
        set(configed, 'data', userInputData)
      }

      if (timeout && !configed.timeout) {
        set(configed, 'timeout', Number.parseInt(timeout, 10))
      }

      if (responseType && !configed.responseType) {
        set(configed, 'responseType', responseType)
      }
    }
    else if (!configed.data) {
      set(configed, 'data', userInputData)
    }
    return configed
  }

  create<
    T extends (
      | defineAPI<string, any, any>
      | Record<string, (...args: any[]) => DefineResponseResult<unknown>>
    )[],
    P = object,
  >(prefix: string,
    defs: string[],
  ) {
    const result = {} as any
    defs.forEach((def) => {
      const defMes = this.parseDef(def)
      if (defMes && defMes.id) {
        const { method, id, url: urlDef, meta } = defMes
        const callFn = (...args: any[]) => {
          let config: Config
          let userInputData
          if (meta?.noArgs) {
            config = args[0]
          }
          else {
            config = args[1]
            userInputData = args[0]
          }
          const { url, dataOrParams } = this.normalizeRequest(
            urlDef,
            userInputData,
            config,
          )

          config = this.patchConfigByMeta(dataOrParams, config, meta)
          config.url = `${prefix}${url}`
          config.method = method

          const { hooks } = meta || {}
          const useSingle
            = config.monanOptions?.single !== undefined
              ? config.monanOptions?.single
              : this.config.single
          const abort = config.monanOptions?.abort !== false
          const requestToken: string = hash({
            m: config.method,
            u: config.url,
            d: config.data,
            p: config.params,
            s: this.config.salt?.(config),
          })

          if (abort) {
            const controller = new AbortController()
            this.abortControllerMap.set(requestToken, controller)

            if (!config.signal) {
              config.signal = controller.signal
            }
          }

          if (useSingle) {
            if (this.requestSet.has(requestToken)) {
              return () =>
                Promise.resolve({
                  __M_skip: true,
                })
            }

            this.requestSet.add(requestToken)
            // mark to test
            config.__M_spy?.(requestToken)
          }

          // mark hooks to hanlder def
          if (hooks?.length) {
            config = hooks.reduce((acc, hookName) => {
              const hook = this.hooks.get(hookName)
              if (hook) {
                return hook(acc, this, {
                  requestToken,
                })
              }
              return acc
            }, config)
          }

          const fn = () => this.instance(config)

          fn.token = requestToken

          return this.genHandleFunc(fn, () => {
            if (requestToken) {
              this.abortControllerMap.delete(requestToken)
              if (useSingle) {
                this.requestSet.delete(requestToken)
              }
            }
          })
        }

        callFn.is = monanSymbol
        result[id] = callFn
      }
    })
    return result as ExtractAPI<T> & P
  }
}
