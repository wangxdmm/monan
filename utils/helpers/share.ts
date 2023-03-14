import { isArray, isNumber, isString } from "./typeAssert";

export type path = string | number;
export type pathArray = path[];
/* istanbul ignore next function */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(..._args: any[]): void {}

export function genAnyBackFunc<T = any>(t: T): () => T {
  return () => t;
}
/**
 * set get pathSolve
 * @param path
 */

function validPath(path: string[], pathOrigin: any): boolean {
  let out = true;

  if (!isArray(path)) {
    out = false;
    console.error(`${path} should be Array`);
  } else {
    for (let i = 0; i < path.length; i++) {
      if (path[i] === "undefined") {
        out = false;
        console.error(`(${pathOrigin}) => (${path})) should not include undefined. get method will back alterValue`);
      }
    }
  }

  return out;
}

export function pathResolve(path: path | pathArray): string[] {
  let pathResolve: string[] = [];
  /* istanbul ignore else */
  if (isString(path) || isNumber(path)) {
    pathResolve = String(path).split(".");
  } else if (isArray(path)) {
    if (path.length === 0) return pathResolve;
    const flatPath = path
      .filter((i) => isString(i) || isNumber(i))
      .map((i) => String(i))
      .reduce((cur: path, next: path) => `${cur}.${next}`);
    pathResolve = flatPath.split(".");
  }
  return validPath(pathResolve, path) ? pathResolve : [];
}
