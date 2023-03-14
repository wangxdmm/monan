import { isUndef } from "./typeAssert";
import { pathResolve, type path, type pathArray } from "./share";

export function get<T = any>(
  source: any,
  path: path | pathArray,
  alterValue?: any,
  judgeFn?: (value: any) => boolean // get策略
): T {
  if (isUndef(source)) {
    if (alterValue === undefined) {
      console.error(`input(${source}) and alter(${alterValue}) can not be undefined together`);
    }
    return alterValue; // source 无值返回 alterValue
  }
  const pathOut: string[] = pathResolve(path).filter((i) => !isUndef(i) && i !== "");
  // 如果路径为空 直接return
  if (pathOut.length === 0) {
    if (isUndef(alterValue)) {
      return source;
    } else {
      return alterValue;
    }
  }
  let result: any;
  for (let i = 0; i < pathOut.length; i++) {
    const curPath = pathOut[i];
    const out = i === 0 ? source[curPath] : result[curPath];
    if (isUndef(out) || (judgeFn && judgeFn(out))) {
      result = alterValue;
      break;
    } else {
      result = out;
    }
  }
  return result as T;
}
