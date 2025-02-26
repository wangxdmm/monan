/* eslint-disable no-fallthrough */
/**
 * Inspired by https://github.com/emotion-js/emotion/blob/main/packages/hash/src/index.ts
 */

export function hash(str: string): string {
  // 'm' and 'r' are mixing constants generated offline.
  // They're not really 'magic', they just happen to work well.

  // const m = 0x5bd1e995;
  // const r = 24;

  // Initialize the hash

  let h = 0

  // Mix 4 bytes at a time into the hash

  let k
  let i = 0
  let len = str.length
  for (; len >= 4; ++i, len -= 4) {
    k
      = (str.charCodeAt(i) & 0xFF)
        | ((str.charCodeAt(++i) & 0xFF) << 8)
        | ((str.charCodeAt(++i) & 0xFF) << 16)
        | ((str.charCodeAt(++i) & 0xFF) << 24)

    k
      /* Math.imul(k, m): */
      = (k & 0xFFFF) * 0x5BD1E995 + (((k >>> 16) * 0xE995) << 16)
    k ^= /* k >>> r: */ k >>> 24

    h
      /* Math.imul(k, m): */
      = ((k & 0xFFFF) * 0x5BD1E995 + (((k >>> 16) * 0xE995) << 16))
      /* Math.imul(h, m): */
        ^ ((h & 0xFFFF) * 0x5BD1E995 + (((h >>> 16) * 0xE995) << 16))
  }

  // Handle the last few bytes of the input array

  switch (len) {
    case 3:
      h ^= (str.charCodeAt(i + 2) & 0xFF) << 16
    case 2:
      h ^= (str.charCodeAt(i + 1) & 0xFF) << 8
    case 1:
      h ^= str.charCodeAt(i) & 0xFF
      h
        /* Math.imul(h, m): */
        = (h & 0xFFFF) * 0x5BD1E995 + (((h >>> 16) * 0xE995) << 16)
  }

  // Do a few final mixes of the hash to ensure the last few
  // bytes are well-incorporated.

  h ^= h >>> 13
  h
    /* Math.imul(h, m): */
    = (h & 0xFFFF) * 0x5BD1E995 + (((h >>> 16) * 0xE995) << 16)

  return ((h ^ (h >>> 15)) >>> 0).toString(36)
}
