import { p as path, a as pathArray } from './share-d05141bc.js';

declare function get<T = any>(source: any, path: path | pathArray, alterValue?: any, judgeFn?: (value: any) => boolean): T;

declare function set(obj: any, path: path | pathArray, value: any, useType?: string): any;

declare function getType(source: any): string;
declare function isArray<T>(x: any): x is Array<T>;
declare function isString(x: any): x is string;
declare function isBoolean(x: any): x is boolean;
declare function isNumber(x: any): x is number;
declare function isFunction(x: any): x is (...args: any[]) => any;
declare function isRegExp(x: any): x is RegExp;
declare function isUndef(x: any): x is undefined | null;
declare function isDef<T = any>(x: T): x is NonNullable<T>;
declare function isEmpty(x: any): boolean;
declare function notEmpty(x: any): boolean;
declare function isEmptyArray<T>(array: T[] | undefined): boolean;
declare function isNonEmptyArray<T>(array?: T[] | null): array is T[];
declare function isObject<T = object>(x: any): x is T;
declare function isEmptyObject(x: any): boolean;
declare function isNumberPlus(x: any): x is number;
declare function isPromise<T = any>(x: any): x is Promise<T>;
declare function isValidArrIndex<T = number>(x: any): x is T;
declare function isServer(): boolean;

type CallsFn<T> = (data: T, dataAll?: T, dataRawAll?: T[]) => boolean | Promise<boolean>;
interface funcReturn<T> {
    (...args: any[]): T;
}
type FetchType<T> = funcReturn<T> | ((...args: any[]) => Promise<T>) | T;
interface IParam<T> {
    fetch: FetchType<T>;
    calls?: CallsFn<T>;
    async?: boolean;
}
interface IBack<T> {
    valid: boolean;
    param: Partial<T>;
}
type Item<T> = IParam<T> | FetchType<T> | undefined | null;
declare function getParam<T = object>(items: Item<Partial<T>>[], before?: (dataArr: Partial<T>[]) => Partial<T>): Promise<IBack<T>>;

type TransMap<T, K extends keyof T> = Record<K, {
    alterVal: ((val: T[K]) => T[K]) | T[K];
    when?: (val: T[K]) => boolean;
}>;
declare function transAttr<T extends Record<string, any>, K extends keyof T>(obj: T, maps: TransMap<T, K>): T;
declare function toHash<T>(arr: Array<T>, path: string[] | string): Record<string, T>;
declare function toHash<T>(arr: Array<T>, path: string[] | string, useIndex: true): Record<string, number>;
declare function divideArray<T>(data: T[], dep?: number): T[][];

declare function genShortId(): string;
declare function genUid(): string;
declare function genUid<T extends string>(namespace: T): `${T}_${string}`;

declare function groupBy<K, V, I>(items: I[], keyMapper: (item: I) => K, valueMapper: (item: I) => V[]): Map<K, V[]>;
declare function toMap<K, V, I>(items: I[], keyMapper: (item: I) => K, valueMapper: (item: I) => V): Map<K, V>;

declare const useNamespace: () => {
    variables: {
        namespace: string;
    };
    getPrefixCls: (scope: string) => string;
};

export { genUid as A, groupBy as B, toMap as C, useNamespace as D, getType as a, isString as b, isBoolean as c, isNumber as d, isFunction as e, isRegExp as f, get as g, isUndef as h, isArray as i, isDef as j, isEmpty as k, isEmptyArray as l, isNonEmptyArray as m, notEmpty as n, isObject as o, isEmptyObject as p, isNumberPlus as q, isPromise as r, set as s, isValidArrIndex as t, isServer as u, getParam as v, transAttr as w, toHash as x, divideArray as y, genShortId as z };
