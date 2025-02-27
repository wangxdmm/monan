import type { AtLeast } from '@monan/types'
import type { IHttpConfig } from './share'
import { DeprecatedRestful } from './deprecatedRestful'
import { genHandleResponse } from './response'
import { Restful } from './restful'

export interface EasyAxiosOptions<T> extends AtLeast<IHttpConfig<T>, 'instance'> {}

export interface DeprecatedFeature {
  useDeprecatedAPI?: boolean
}

export function defineEasyAxios<T, O extends EasyAxiosOptions<T> = EasyAxiosOptions<T>>(
  options: O
): {
  http: Restful<T>
} & ReturnType<typeof genHandleResponse>
export function defineEasyAxios<T, O extends EasyAxiosOptions<T> = EasyAxiosOptions<T>>(
  options: O,
  useDeprecatedFeatures: true
): {
  http: DeprecatedRestful<T>
} & ReturnType<typeof genHandleResponse>
export function defineEasyAxios<T, O extends EasyAxiosOptions<T>>(options: O, useDeprecatedFeatures?: boolean) {
  const http = useDeprecatedFeatures ? new DeprecatedRestful<T>(options) : new Restful<T>(options)

  return {
    http,
    ...genHandleResponse(http),
  }
}
