import * as axios from 'axios';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, AxiosInterceptorOptions, Method } from 'axios';
import { n as noop } from './share-d05141bc.js';

type AnyObject = Record<any, any>;
type AnyFunction = (...args: any[]) => any;
type AnyFunctionObject = Record<string, (...args: any[]) => any>;
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
type NotEqual<X, Y> = true extends Equal<X, Y> ? false : true;
type PickValue<T, K extends keyof T> = NonNullable<Pick<T, K>[K]>;
type ExtractValues<T, K extends keyof Readonly<T> = keyof Readonly<T>> = Readonly<T>[K];
type IsTrue<T extends true> = T;
type IsFalse<T extends false> = T;
type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;
type isNever<T> = [T] extends [never] ? true : false;
/**
 * @example
 * get({code: 'all'} as const) 查询全部
 * get({code: 'el-button'}) 单个查询
 */
type UniGetBack<T, F, R> = Equal<T, {
    readonly code: 'all';
}> extends true ? F : R;

declare class SetupAxios<T> {
    config: AtLeast<IHttpConfig<T>, "autoSetting" | "errorFlag" | "instance">;
    instance: AxiosInstance;
    dynamicRequestConfig: Map<string, DynamicRequestConfig<T>>;
    dynamicHanlder: Map<T, DynamicHandler<T>>;
    defaultConfig: {
        autoSetting: boolean;
        errorFlag: string;
        dynamicHandlerIds: never[];
    };
    constructor(config: AtLeast<IHttpConfig<T>, "instance">);
    init(): void;
    registerDynamicHandler(name: T, fn: DynamicHandler<T>): void;
    getDynamicHandler(name: T): DynamicHandler<T> | undefined;
    registerDynamicRequestConfig<R = any>(name: string, fn: DynamicRequestConfig<T>["invoke"], config?: AtLeast<DynamicRequestConfig<T, R>, "when">): void;
    getDynamicRequestConfig(name: any): DynamicRequestConfig<T>["invoke"];
    removeDynamicRequestConfig(name: string): void;
    isSysError(x: any): x is SysError;
    getInstance(): AxiosInstance;
    setConfig(): void;
    handleInstance(instance: AxiosInstance): void;
    get preRequest(): (config: AxiosRequestConfig) => AxiosRequestConfig<any>;
    getInterceptorOptions(type: InterceptorOptionsType): axios.AxiosInterceptorOptions | undefined;
    get handleResponse(): (result: AxiosResponse) => AxiosResponse<any, any>;
    catchError(error: AxiosError): Promise<SysError>;
    useParamInject<RequestParam = any>(urlIn: any, paramsIn: RequestParam, config?: Config): false | {
        url: string;
        data: Partial<NonNullable<RequestParam>>;
    };
    normalizeRequest<R = any>(urlIn: any, paramsIn?: R, config?: Config): {
        url: string;
        dataOrParams: Partial<R>;
    };
    static interParam: <T_1, K extends keyof T_1>(urlIn: string, dataIn: T_1, reserve?: boolean) => {
        url: string;
        data: T_1;
    };
}

declare const ContentTypeKey = "Content-Type";
declare enum ContentTypeEnum {
    JSON = "application/json",
    FORM = "application/x-www-form-urlencoded",
    MULTIPART = "multipart/form-data"
}
declare enum HandleEnum {
    SUCCESS = "SUCCESS",
    FAIL = "FAIL",
    SYSTEM_ERROR = "SYSTEM_ERROR"
}
type HandleEnumKeys = keyof typeof HandleEnum;
declare const handleEnumValues: HandleEnum[];
type DynamicHandlerIds = "tokenOutdate";
type ICodeHandlerParam<T> = {
    code: number | string;
    error: AxiosError;
    ins: AxiosInstance | AxiosInstance[];
    back: Promise<SysError>;
    rowBack: SysError;
    httpIns: SetupAxios<T>;
    dynamicHandler?: ICodeHandler<T>["handler"];
};
declare function genContentHeader(type: ContentTypeEnum): {
    "Content-Type": any;
};
interface IHttpConfig<T> {
    instance: AxiosInstance;
    autoSetting: boolean;
    errorFlag: string;
    codeHandler: ICodeHandler<T>[];
    request(config: AxiosRequestConfig, ins: SetupAxios<T>): AxiosRequestConfig;
    interceptorOptions(type: InterceptorOptionsType, ins: SetupAxios<T>): AxiosInterceptorOptions;
    response(res: AxiosResponse, ins: SetupAxios<T>): AxiosResponse;
    transIns(ins: AxiosInstance, setUpIns: SetupAxios<T>): void;
}
type DynamicRequestConfig<T, R = any> = {
    invoke: (config: AxiosRequestConfig<R>) => AxiosRequestConfig<R>;
    when: ((config: AxiosRequestConfig, ins: SetupAxios<T>) => boolean) | boolean;
};
type InterceptorOptionsType = "request" | "response";
type GetHandlerIds<T> = T extends readonly [{
    id: infer K;
}, ...infer Rest] ? K | GetHandlerIds<Rest> : never;
type DynamicHandler<T> = (params: Parameters<ICodeHandler<T>["handler"]>[0]) => any;
type FetchFunc<T = object, K = any> = (data?: T, reserve?: boolean, others?: object) => Promise<AxiosResponse<K> | SysError>;
type IRestResult = Record<string, FetchFunc>;
type BatchRowBackType<T> = AxiosResponse<T> | SysError;
type BatchBackType<T> = Promise<BatchRowBackType<T>>;
interface ICodeHandler<T> {
    id?: T;
    on?: RegExp | number[];
    async?: boolean;
    handler: (back: ICodeHandlerParam<T>) => any;
}
interface ICodeHandler<T> {
    id?: T;
    on?: RegExp | number[];
    async?: boolean;
    handler: (back: ICodeHandlerParam<T>) => any;
}
interface SysError<T = any> {
    error: AxiosError<T>;
    isSysError?: boolean;
    hasHandled?: boolean;
    [index: string]: boolean | AxiosError | undefined;
}
type Config<D = any> = AxiosRequestConfig<D> & {
    __R_reverse?: boolean;
    __R_interParam?: <T>(url: string, dataIn: T, reverse?: boolean) => {
        url: string;
        data: Partial<T>;
    };
};
type MessageTip = (messageOrOptions?: string | Partial<MessageOptions>) => void;
/**
 * You can define your own MessageOptions in your own project: like element-plus.MessageOptions
 * import type { MessageOptions } from 'element-plus';
 * declare module '@runafe/platform-share' {
 * export interface MessageOptions  extends OtherMessageOptions{}
 */
interface MessageOptions {
    message?: string;
}
type defineAPI<Id, Data = any, Response = any> = {
    id: Id;
    data: Data;
    response: Response;
};
interface LabelDef {
    method: Method;
    url: string;
    id: string;
    meta?: {
        noArgs?: boolean;
        contentType?: ContentTypeEnum;
        makeInputAsParams?: boolean;
        timeout?: string;
        responseType?: "arraybuffer" | "document" | "json" | "text" | "stream" | "blob";
    };
}
type UnionBack<T> = AxiosResponse<T, any> | SysError<T>;
interface Response<T = any, S extends boolean | string | number = boolean> {
    __R_response?: true;
}
interface ResponseResult<T, D = T extends AxiosResponse<infer K> ? K extends Response<infer R> ? Equal<R, unknown> extends true ? K : R : K : never, R = T extends AxiosResponse<infer K> ? K : never> {
    result: boolean;
    backData?: D;
    wholeData?: R;
    error?: Response<D, false>;
    sysError?: T extends SysError ? T : never;
    response: AxiosResponse<R>;
    message?: string;
    notify: (mes?: Partial<Record<HandleEnumKeys, Partial<MessageOptions>>> | string | (string | undefined)[]) => void;
}
interface HandleResponseConfig {
    notificationDelay?: boolean;
    isSuccess?: (res: AxiosResponse<any>) => boolean;
    getBackData?: (type: HandleEnum, res: UnionBack<any>) => any;
    getMessage?: (type: HandleEnum, res: UnionBack<any>) => any;
}
declare const PlainKey: unique symbol;
type SymbolPlainKey = typeof PlainKey;
interface UsePrimitiveType<T> {
    [PlainKey]: T;
}
interface DefaultStrategies<D = any> {
    isSuccess: (res: AxiosResponse<D>) => boolean;
    getBackData: (type: HandleEnum, res: AxiosResponse<D>) => D;
    getMessage: (type: HandleEnum, res: AxiosResponse<D>) => string;
    showErrorMessageTip: MessageTip;
    showSuccessMessageTip: MessageTip;
}
type WrapResponse<T> = T extends Response<unknown> ? T : T extends UsePrimitiveType<infer P> ? P : Response<T>;
type ExtractAPI<T> = T extends [infer F, ...infer Rest] ? F extends defineAPI<infer Id, infer Data, infer Response> ? Id extends string ? {
    [k in Id]: (...p: Data extends [infer Params, infer D] ? [Params] extends [void] ? [D] extends [void] ? [config?: Config] : [data: D, config?: Config<D>] : [params: Params, config?: Config<D>] : Data extends [infer P] ? [params: P, config?: Config] : [Data] extends [void] ? [config?: Config] : [data: Data, config?: Config]) => (config?: HandleResponseConfig) => Promise<ResponseResult<UnionBack<WrapResponse<Response>>>>;
} & ExtractAPI<Rest> : unknown : unknown : unknown;
type GenHandleFunc = <T>(response: BatchBackType<T>) => (config?: HandleResponseConfig) => Promise<ResponseResult<UnionBack<T>>>;

declare class Restful<T> extends SetupAxios<T> {
    genHandleFunc: GenHandleFunc;
    defaultStrategies: Partial<DefaultStrategies>;
    createDefaultStrategies<D>(strategiesCreator: (ins: this) => DefaultStrategies<D>): void;
    get defaultIsSuccess(): ((res: axios.AxiosResponse<any, any>) => boolean) | typeof noop;
    get defaultGetBackData(): typeof noop | ((type: HandleEnum, res: axios.AxiosResponse<any, any>) => any);
    get defaualtGetMessage(): typeof noop | ((type: HandleEnum, res: axios.AxiosResponse<any, any>) => string);
    get showErrorMessageTip(): MessageTip | typeof noop;
    get showSuccessMessageTip(): MessageTip | typeof noop;
    updateHandleFunc(fn: GenHandleFunc): void;
    parseDef(def: string): LabelDef | undefined;
    patchConfigByMeta(userInputData: any, config: Config, meta: LabelDef["meta"]): Config;
    create<T extends defineAPI<string, any, any>[]>(prefix: string, defs: string[]): ExtractAPI<T> & Record<string, any>;
}

/**@deprecated please use Restful this api will be removed in next major version */
declare class DeprecatedRestful<T> extends Restful<T> {
    /**@deprecated please use this.instance(getConfig) or create to generate api you want*/
    get<Result = any, RequestParam = any>(urlIn: any, params?: RequestParam, config?: Config): BatchBackType<WrapResponse<Result>>;
    /**@deprecated please use this.instance(deleteConfig) or create to generate api you want*/
    delete<Result = any, RequestParam = any>(urlIn: any, body: RequestParam, config?: Config): BatchBackType<WrapResponse<Result>>;
    /**@deprecated please use this.instance(postConfig) or create to generate api you want*/
    post<Result = any, RequestParam = any>(urlIn: any, body: RequestParam, config?: Config): BatchBackType<WrapResponse<Result>>;
    /**@deprecated please use this.instance(putConfig) or create to generate api you want*/
    put<Result = any, RequestParam = any>(urlIn: any, body: RequestParam, config?: Config): BatchBackType<WrapResponse<Result>>;
    /**@deprecated please use this.instance(patchConfig) or create to generate api you want*/
    patch<Result = any, RequestParam = any>(urlIn: any, body: RequestParam, config?: Config): BatchBackType<WrapResponse<Result>>;
}

declare function genHandleResponse<T>(http: Restful<T>): {
    isSysError: <T_1 = any>(x: any) => x is SysError<T_1>;
    handleResponse: <T_1 extends UnionBack<any>>(res: T_1, configIn?: HandleResponseConfig) => ResponseResult<T_1, T_1 extends axios.AxiosResponse<infer K, any> ? K extends Response<infer R, boolean> ? undefined<R, unknown> extends true ? K : R : K : never, T_1 extends axios.AxiosResponse<infer K_1, any> ? K_1 : never>;
    genHandleFunc: <T_2>(response: BatchBackType<T_2>) => (config?: HandleResponseConfig) => Promise<ResponseResult<BatchRowBackType<T_2>, T_2 extends Response<infer R, boolean> ? undefined<R, unknown> extends true ? T_2 : R : T_2, T_2>>;
}

interface EasyAxiosOptions<T> extends AtLeast<IHttpConfig<T>, "instance"> {
}
interface DepreactedFeature {
    useDeprecatedAPI?: boolean;
}
declare function defineEasyAxios<T, O extends EasyAxiosOptions<T> = EasyAxiosOptions<T>>(options: O): {
    http: Restful<T>;
} & ReturnType<typeof genHandleResponse>;
declare function defineEasyAxios<T, O extends EasyAxiosOptions<T> = EasyAxiosOptions<T>>(options: O, useDeprecatedFeatures: true): {
    http: DeprecatedRestful<T>;
} & ReturnType<typeof genHandleResponse>;

export { AnyObject as A, BatchRowBackType as B, ContentTypeKey as C, DynamicHandlerIds as D, ExtractAPI as E, FetchFunc as F, GetHandlerIds as G, HandleEnum as H, ICodeHandlerParam as I, AnyFunction as J, AnyFunctionObject as K, LabelDef as L, MessageTip as M, Equal as N, NotEqual as O, PlainKey as P, PickValue as Q, Response as R, SysError as S, ExtractValues as T, UnionBack as U, IsTrue as V, WrapResponse as W, IsFalse as X, AtLeast as Y, isNever as Z, UniGetBack as _, ContentTypeEnum as a, HandleEnumKeys as b, ICodeHandler as c, IHttpConfig as d, DynamicRequestConfig as e, InterceptorOptionsType as f, genContentHeader as g, handleEnumValues as h, DynamicHandler as i, IRestResult as j, BatchBackType as k, Config as l, MessageOptions as m, defineAPI as n, ResponseResult as o, HandleResponseConfig as p, SymbolPlainKey as q, UsePrimitiveType as r, DefaultStrategies as s, GenHandleFunc as t, EasyAxiosOptions as u, DepreactedFeature as v, defineEasyAxios as w, SetupAxios as x, Restful as y, DeprecatedRestful as z };
