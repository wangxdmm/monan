export function getType(source: any): string {
  return Object.prototype.toString.call(source).slice("[object ".length, -1);
}

export function isArray<T>(x: any): x is Array<T> {
  return getType(x) === "Array";
}

export function isString(x: any): x is string {
  return getType(x) === "String";
}

export function isBoolean(x: any): x is boolean {
  return getType(x) === "Boolean";
}

export function isNumber(x: any): x is number {
  return getType(x) === "Number";
}

export function isFunction(x: any): x is (...args: any[]) => any {
  return getType(x) === "Function";
}

export function isRegExp(x: any): x is RegExp {
  return getType(x) === "RegExp";
}

export function isUndef(x: any): x is undefined | null {
  return x === undefined || x === null;
}

export function isDef<T = any>(x: T): x is NonNullable<T> {
  return x !== undefined && x !== null;
}

export function isEmpty(x: any): boolean {
  return [null, undefined, ""].includes(x);
}

export function notEmpty(x: any): boolean {
  return !isEmpty(x);
}

export function isEmptyArray<T>(array: T[] | undefined): boolean {
  return isArray(array) && array.length === 0;
}

export function isNonEmptyArray<T>(array?: T[] | null): array is T[] {
  return isArray(array) && array.length > 0;
}

export function isObject<T = object>(x: any): x is T {
  return isDef(x) && getType(x) === "Object";
}

export function isEmptyObject(x: any): boolean {
  let flag = true;
  for (const attr in x) {
    /* istanbul ignore else */
    // eslint-disable-next-line no-prototype-builtins
    if (x.hasOwnProperty && x.hasOwnProperty(attr)) {
      flag = false;
    }
  }
  return flag;
}

export function isNumberPlus(x: any): x is number {
  return /^\d+$/gi.test(x);
}

export function isPromise<T = any>(x: any): x is Promise<T> {
  return isDef<any>(x) && isFunction(x.then) && isFunction(x.catch);
}

export function isValidArrIndex<T = number>(x: any): x is T {
  return isDef(x) && x >= 0;
}

export function isServer(): boolean {
  return typeof window === "undefined";
}
