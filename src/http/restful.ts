import type { Method } from 'axios'
import { get, noop, set } from '../helpers'
import { SetupAxios } from './setupAxios'
import type {
  Config,
  DefaultStrategies,
  ExtractAPI,
  GenHandleFunc,
  LabelDef,
  ServerDefinedResponse,
  defineAPI,
} from './share'
import { ContentTypeEnum, ContentTypeKey } from './share'

export const NO_ID_WHEN_INJECT_PARAM_ERROR = 'When your def match /a/b/{something},you should specificly give a alterName by use /a/b/{something}->alterName'

export class Restful<T> extends SetupAxios<T> {
  genHandleFunc!: GenHandleFunc
  defaultStrategies: Partial<DefaultStrategies> = {}

  createDefaultStrategies<D = ServerDefinedResponse>(
    strategiesCreator: (ins: this) => DefaultStrategies<D>,
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
      [url, id] = url.split(valueDiv)
      if (url.slice(-1) === '?') {
        meta.makeInputAsParams = true
        url = url.slice(0, -1)
      }

      if (!id) {
        let mayBeId = url.split('/').pop()
        if (mayBeId && mayBeId.trim()) {
          mayBeId = mayBeId.trim()
          const injectParamReg = /{([^/.]+)}/g
          if (!injectParamReg.test(mayBeId))
            id = mayBeId
          else
            throw new Error(NO_ID_WHEN_INJECT_PARAM_ERROR)
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
        meta[k] = v
      })
    }

    // `data` is the data to be sent as the request body
    // Only applicable for request methods 'PUT', 'POST', 'DELETE , and 'PATCH'
    // https://github.com/axios/axios
    if (!['put', 'post', 'delete', 'patch'].includes(method))
      meta.makeInputAsParams = true

    return {
      id,
      url,
      method: method as Method,
      meta,
    }
  }

  patchConfigByMeta(
    userInputData,
    config: Config,
    meta: LabelDef['meta'],
  ): Config {
    const configed: Config = config || {}
    if (meta) {
      let contentType
      const { timeout, makeInputAsParams: params, responseType } = meta

      if (meta.contentType)
        contentType = meta.contentType.toUpperCase()

      if (contentType && !get(configed, ['headers', ContentTypeKey])) {
        ContentTypeEnum[contentType]
          && set(
            configed,
            ['headers', ContentTypeKey],
            ContentTypeEnum[contentType],
          )
      }

      if (params && !configed.params)
        set(configed, 'params', userInputData)

      // default userInputData is set to config.data
      if (!params && !configed.data)
        set(configed, 'data', userInputData)

      if (timeout && !configed.timeout)
        set(configed, 'timeout', parseInt(timeout, 10))

      if (responseType && !configed.responseType)
        set(configed, 'responseType', responseType)
    }
    else if (!configed.data) {
      set(configed, 'data', userInputData)
    }
    return configed
  }

  create<T extends defineAPI<string, any, any>[]>(
    prefix: string,
    defs: string[],
  ) {
    const result = {}
    defs.forEach((def) => {
      const defMes = this.parseDef(def)
      if (defMes && defMes.id) {
        const { method, id, url: urlDef, meta } = defMes
        result[id] = (...args) => {
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
          return this.genHandleFunc(this.instance(config))
        }
      }
    })
    return result as ExtractAPI<T>
  }
}
