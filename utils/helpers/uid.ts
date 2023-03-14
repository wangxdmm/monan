import { ShortId } from "./genShortId";

export function genShortId(): string {
  return new ShortId({
    salts: 4,
  }).gen();
}

export function genUid(): string;
export function genUid<T extends string>(namespace: T): `${T}_${string}`;
export function genUid<T extends string>(namespace?: T): string | `${T}_${string}` {
  const uid = genShortId();
  if (namespace) {
    return `${namespace}_${uid}`;
  }
  return uid;
}
