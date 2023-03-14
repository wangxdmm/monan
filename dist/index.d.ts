export { g as genAnyBackFunc, n as noop, p as path, a as pathArray, b as pathResolve } from './share-d05141bc.js';
export { y as divideArray, z as genShortId, A as genUid, g as get, v as getParam, a as getType, B as groupBy, i as isArray, c as isBoolean, j as isDef, k as isEmpty, l as isEmptyArray, p as isEmptyObject, e as isFunction, m as isNonEmptyArray, d as isNumber, q as isNumberPlus, o as isObject, r as isPromise, f as isRegExp, u as isServer, b as isString, h as isUndef, t as isValidArrIndex, n as notEmpty, s as set, x as toHash, C as toMap, w as transAttr, D as useNamespace } from './useNamespace-ccf14551.js';
export { J as AnyFunction, K as AnyFunctionObject, A as AnyObject, Y as AtLeast, k as BatchBackType, B as BatchRowBackType, l as Config, a as ContentTypeEnum, C as ContentTypeKey, s as DefaultStrategies, v as DepreactedFeature, z as DeprecatedRestful, i as DynamicHandler, D as DynamicHandlerIds, e as DynamicRequestConfig, u as EasyAxiosOptions, N as Equal, E as ExtractAPI, T as ExtractValues, F as FetchFunc, t as GenHandleFunc, G as GetHandlerIds, H as HandleEnum, b as HandleEnumKeys, p as HandleResponseConfig, c as ICodeHandler, I as ICodeHandlerParam, d as IHttpConfig, j as IRestResult, f as InterceptorOptionsType, X as IsFalse, V as IsTrue, L as LabelDef, m as MessageOptions, M as MessageTip, O as NotEqual, Q as PickValue, P as PlainKey, R as Response, o as ResponseResult, y as Restful, x as SetupAxios, q as SymbolPlainKey, S as SysError, _ as UniGetBack, U as UnionBack, r as UsePrimitiveType, W as WrapResponse, n as defineAPI, w as defineEasyAxios, g as genContentHeader, h as handleEnumValues, Z as isNever } from './defineEasyAxios-73831115.js';
import 'axios';

/**
 * @itemId 平台所有subList unique key
 */
interface SubListUniKey<T = string | number> {
    itemId?: T;
}
type AddSubKey<T> = T extends {
    itemId?: any;
} ? T : T & {
    itemId?: SubListUniKey;
};

export { AddSubKey, SubListUniKey };
