export type AnyObject = Record<any, any>
export type AnyFunction = (...args: any[]) => any
export type AnyFunctionObject = Record<string, (...args: any[]) => any>
export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T,
>() => T extends Y ? 1 : 2
  ? true
  : false
export type NotEqual<X, Y> = true extends Equal<X, Y> ? false : true

export type PickValue<T, K extends keyof T> = NonNullable<Pick<T, K>[K]>
export type ExtractValues<
  T,
  K extends keyof Readonly<T> = keyof Readonly<T>,
> = Readonly<T>[K]

export type IsTrue<T extends true> = T
export type IsFalse<T extends false> = T

export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>
export type isNever<T> = [T] extends [never] ? true : false
