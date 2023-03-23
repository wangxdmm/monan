# common utils lib

## http

### usage

```typescript
// main.ts
import axios from "axios";
import {
  defineEasyAxios,
  type defineAPI,
} from "@runafe/platform-share";

export type CodeHandlerTypes = 'tokenOutdate';
const handlers: ICodeHandler<CodeHandlerTypes>[] = [
  {
    on: /^5/gi,
    handler: ({ error, back }) => {
      notice(friendlyGetMes(error));
      return back;
    },
  },
  {
    id: "tokenOutdate",
    on: [401],
    handler: async (params) => {},
    async: true,
  },
];

// define axios config
const { http, genHandleFunc } = defineEasyAxios<CodeHandlerTypes>({
  instance: axios.create({
    baseURL: "/v1",
  }),
  codeHandler,
});

// register default strategies for all request
http.createDefaultStrategies((ins) => DefaultStrategies);

// dynamicly inject token
http.registerDynamicRequestConfig('token', config => {
  const tokenData = oauth.token;
  config.headers![oauth.tokenKey] = oauth.tokenValue;
  return config;
});

interface DefaultStrategies<D = any> {
  isSuccess: (res: AxiosResponse<D>) => boolean;
  getBackData: (type: HandleEnum, res: AxiosResponse<D>) => D;
  getMessage: (type: HandleEnum, res: AxiosResponse<D>) => string;
  showErrorMessageTip: MessageTip;
  showSuccessMessageTip: MessageTip;
}

declare type defineAPI<Id, Data = any, ServerDefinedResponse = any> = {
  id: Id;
  data: Data;
  response: ServerDefinedResponse;
};

// create restful api
// 1. no param and data
//  get -> prefix/name/login -> result.login(config?: AxiosConfig): number
const result = http.create<[defineAPI<"login", void, number>]>("prefix/name", ["get()::/login"]);
const { backData } = await result.login()(); // backData's type is number | undefined
// 2. param
// delete -> prefix/name/del -> result.del(param: string ,config?: AxiosConfig): number
const result = http.create<[defineAPI<"del", string, number>]>("prefix/name", ["delete::/del?"]);
// 3. data
// post -> prefix/name/posturl -> result.posturl(data: {age: number}): number
const result = http.create<[defineAPI<"posturl", {age: number}, number>]>("prefix/name", ["post::/posturl"]);
// 4. param and data
// post -> prefix/name/posturl -> result.postNameAlias(param: {name: string}, {data: {age: number}})
const result = http.create<[defineAPI<"postNameAlias", [{name: string}, {age: number}], number>]>("prefix/name", ["post::/posturl?->postNameAlias"]); 
// 5. with simple config
http.create("prefix", "post::/posturl::timeout->1000,contentType->form,responseType->blob")

// declare your own Response and message in env.d.ts or other global ts declaration file
declare module '@runafe/platform-share' {
  export interface ServerDefinedResponse<T = any, S = boolean> {
    code: number;
    data?: T;
    message?: string;
    success: S;
    total?: number;
  }
  // ElMessageOptions from element-plus
  export interface MessageOptions extends ElMessageOptions {}
}

```
