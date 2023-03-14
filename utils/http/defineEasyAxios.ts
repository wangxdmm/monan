import { DeprecatedRestful } from "./deprecatedRestful";
import { Restful } from "./restful";
import { genHandleResponse } from "./response";
import type { IHttpConfig } from "./share";
import type { AtLeast } from "../../ts";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EasyAxiosOptions<T> extends AtLeast<IHttpConfig<T>, "instance"> {}

export interface DepreactedFeature {
  useDeprecatedAPI?: boolean;
}

export function defineEasyAxios<T, O extends EasyAxiosOptions<T> = EasyAxiosOptions<T>>(
  options: O
): {
  http: Restful<T>;
} & ReturnType<typeof genHandleResponse>;
export function defineEasyAxios<T, O extends EasyAxiosOptions<T> = EasyAxiosOptions<T>>(
  options: O,
  useDeprecatedFeatures: true
): {
  http: DeprecatedRestful<T>;
} & ReturnType<typeof genHandleResponse>;
export function defineEasyAxios<T, O extends EasyAxiosOptions<T>>(options: O, useDeprecatedFeatures?: boolean) {
  const http = useDeprecatedFeatures ? new DeprecatedRestful<T>(options) : new Restful<T>(options);

  return {
    http,
    ...genHandleResponse(http),
  };
}
