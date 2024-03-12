import { monanSymbol, type GenHandleFunc } from './share'

export function isMonanRequest(x: any): x is GenHandleFunc {
  return x.is === monanSymbol
}
