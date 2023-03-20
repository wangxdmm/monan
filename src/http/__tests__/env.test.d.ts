
// delcare your own ServerDefinedResponse T is backData S is result flag
declare module '..' {
  export interface ServerDefinedResponse<T = unknown, S = boolean> {
    code: number
    data?: T
    message?: string
    success: S
    total?: number
  }
}

export {}
