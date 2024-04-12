import { type GenHandleFunc, monanSymbol } from './share'

export function isMonanRequest(x: any): x is GenHandleFunc {
  return x.is === monanSymbol
}
