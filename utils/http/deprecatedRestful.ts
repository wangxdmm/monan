import { Restful } from "./restful";
import type { WrapResponse, BatchBackType, Config } from "./share";

/**@deprecated please use Restful this api will be removed in next major version */
export class DeprecatedRestful<T> extends Restful<T> {
  /**@deprecated please use this.instance(getConfig) or create to generate api you want*/
  get<Result = any, RequestParam = any>(urlIn, params?: RequestParam, config?: Config) {
    const { url, dataOrParams } = this.normalizeRequest(urlIn, params, config);
    return this.instance.get(url, {
      params: dataOrParams,
      ...config,
    }) as BatchBackType<WrapResponse<Result>>;
  }

  /**@deprecated please use this.instance(deleteConfig) or create to generate api you want*/
  delete<Result = any, RequestParam = any>(urlIn, body: RequestParam, config?: Config) {
    const { url, dataOrParams } = this.normalizeRequest(urlIn, body, config);
    return this.instance.delete(url, {
      data: dataOrParams,
      ...config,
    }) as BatchBackType<WrapResponse<Result>>;
  }

  /**@deprecated please use this.instance(postConfig) or create to generate api you want*/
  post<Result = any, RequestParam = any>(urlIn, body: RequestParam, config?: Config) {
    const { url, dataOrParams } = this.normalizeRequest(urlIn, body, config);
    return this.instance.post(url, dataOrParams, {
      ...config,
    }) as BatchBackType<WrapResponse<Result>>;
  }

  /**@deprecated please use this.instance(putConfig) or create to generate api you want*/
  put<Result = any, RequestParam = any>(urlIn, body: RequestParam, config?: Config) {
    const { url, dataOrParams } = this.normalizeRequest(urlIn, body, config);
    return this.instance.put(url, dataOrParams, {
      ...config,
    }) as BatchBackType<WrapResponse<Result>>;
  }

  /**@deprecated please use this.instance(patchConfig) or create to generate api you want*/
  patch<Result = any, RequestParam = any>(urlIn, body: RequestParam, config?: Config) {
    const { url, dataOrParams } = this.normalizeRequest(urlIn, body, config);
    return this.instance.patch(url, dataOrParams, {
      ...config,
    }) as BatchBackType<WrapResponse<Result>>;
  }
}
