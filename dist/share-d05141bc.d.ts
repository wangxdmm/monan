type path = string | number;
type pathArray = path[];
declare function noop(..._args: any[]): void;
declare function genAnyBackFunc<T = any>(t: T): () => T;
declare function pathResolve(path: path | pathArray): string[];

export { pathArray as a, pathResolve as b, genAnyBackFunc as g, noop as n, path as p };
