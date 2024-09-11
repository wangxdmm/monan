/* eslint-disable no-restricted-properties */
/* eslint-disable no-proto */
import {
  copyArrayBuffer,
  copyArrayLoose,
  copyArrayStrict,
  copyBlob,
  copyDataView,
  copyDate,
  copyMapLoose,
  copyMapStrict,
  copyObjectLoose,
  copyObjectStrict,
  copyPrimitiveWrapper,
  copyRegExp,
  copySelf,
  copySetLoose,
  copySetStrict,
} from './copier'
import { createCache, getTag } from './utils'

import type { InternalCopier, State } from './copier'

export type { State } from './copier'

const { isArray } = Array
const { assign } = Object

const getPrototypeOf = Object.getPrototypeOf || (obj => obj.__proto__)

export interface CreateCopierOptions {
  array?: InternalCopier<any[]>
  arrayBuffer?: InternalCopier<ArrayBuffer>
  blob?: InternalCopier<Blob>
  dataView?: InternalCopier<DataView>
  date?: InternalCopier<Date>
  error?: InternalCopier<any>
  map?: InternalCopier<Map<any, any>>
  object?: InternalCopier<Record<string, any>>
  regExp?: InternalCopier<RegExp>
  set?: InternalCopier<Set<any>>
}

const DEFAULT_LOOSE_OPTIONS: Required<CreateCopierOptions> = {
  array: copyArrayLoose,
  arrayBuffer: copyArrayBuffer,
  blob: copyBlob,
  dataView: copyDataView,
  date: copyDate,
  error: copySelf,
  map: copyMapLoose,
  object: copyObjectLoose,
  regExp: copyRegExp,
  set: copySetLoose,
}
const DEFAULT_STRICT_OPTIONS: Required<CreateCopierOptions> = /* #__PURE__ */assign({}, DEFAULT_LOOSE_OPTIONS, {
  array: copyArrayStrict,
  map: copyMapStrict,
  object: copyObjectStrict,
  set: copySetStrict,
})

/**
 * Get the copiers used for each specific object tag.
 */
function getTagSpecificCopiers(
  options: Required<CreateCopierOptions>,
): Record<string, InternalCopier<any>> {
  return {
    Arguments: options.object,
    Array: options.array,
    ArrayBuffer: options.arrayBuffer,
    Blob: options.blob,
    Boolean: copyPrimitiveWrapper,
    DataView: options.dataView,
    Date: options.date,
    Error: options.error,
    Float32Array: options.arrayBuffer,
    Float64Array: options.arrayBuffer,
    Int8Array: options.arrayBuffer,
    Int16Array: options.arrayBuffer,
    Int32Array: options.arrayBuffer,
    Map: options.map,
    Number: copyPrimitiveWrapper,
    Object: options.object,
    Promise: copySelf,
    RegExp: options.regExp,
    Set: options.set,
    String: copyPrimitiveWrapper,
    WeakMap: copySelf,
    WeakSet: copySelf,
    Uint8Array: options.arrayBuffer,
    Uint8ClampedArray: options.arrayBuffer,
    Uint16Array: options.arrayBuffer,
    Uint32Array: options.arrayBuffer,
    Uint64Array: options.arrayBuffer,
  }
}

/**
 * Create a custom copier based on the object-specific copy methods passed.
 */
export function createCopier(options: CreateCopierOptions) {
  const normalizedOptions = assign({}, DEFAULT_LOOSE_OPTIONS, options)
  const tagSpecificCopiers = getTagSpecificCopiers(normalizedOptions)
  const { Array: array, Object: object } = tagSpecificCopiers

  function copier(value: any, state: State): any {
    state.prototype = state.Constructor = undefined

    if (!value || typeof value !== 'object') {
      return value
    }

    if (state.cache.has(value)) {
      return state.cache.get(value)
    }

    state.prototype = getPrototypeOf(value)
    state.Constructor = state.prototype && state.prototype.constructor

    // plain objects
    if (!state.Constructor || state.Constructor === Object) {
      return object(value, state)
    }

    // arrays
    if (isArray(value)) {
      return array(value, state)
    }

    const tagSpecificCopier = tagSpecificCopiers[getTag(value)]

    if (tagSpecificCopier) {
      return tagSpecificCopier(value, state)
    }

    return typeof value.then === 'function' ? value : object(value, state)
  }

  return function copy<Value>(value: Value): Value {
    return copier(value, {
      Constructor: undefined,
      cache: createCache(),
      copier,
      prototype: undefined,
    })
  }
}

/**
 * Create a custom copier based on the object-specific copy methods passed,
 * defaulting to the same internals as `copyStrict`.
 */
export function createStrictCopier(options: CreateCopierOptions) {
  return createCopier(assign({}, DEFAULT_STRICT_OPTIONS, options))
}

/**
 * Copy an value deeply as much as possible, where strict recreation of object
 * properties are maintained. All properties (including non-enumerable ones) are
 * copied with their original property descriptors on both objects and arrays.
 */
export const copyStrict = /* #__PURE__ */ createStrictCopier({})

/**
 * Copy an value deeply as much as possible.
 */
export const copy = /* #__PURE__ */ createCopier({})
