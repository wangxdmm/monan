"use strict";Object.defineProperty(exports, "__esModule", {value: true});var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// utils/helpers/typeAssert.ts
function getType(source) {
  return Object.prototype.toString.call(source).slice("[object ".length, -1);
}
function isArray(x) {
  return getType(x) === "Array";
}
function isString(x) {
  return getType(x) === "String";
}
function isBoolean(x) {
  return getType(x) === "Boolean";
}
function isNumber(x) {
  return getType(x) === "Number";
}
function isFunction(x) {
  return getType(x) === "Function";
}
function isRegExp(x) {
  return getType(x) === "RegExp";
}
function isUndef(x) {
  return x === void 0 || x === null;
}
function isDef(x) {
  return x !== void 0 && x !== null;
}
function isEmpty(x) {
  return [null, void 0, ""].includes(x);
}
function notEmpty(x) {
  return !isEmpty(x);
}
function isEmptyArray(array) {
  return isArray(array) && array.length === 0;
}
function isNonEmptyArray(array) {
  return isArray(array) && array.length > 0;
}
function isObject(x) {
  return isDef(x) && getType(x) === "Object";
}
function isEmptyObject(x) {
  let flag = true;
  for (const attr in x) {
    if (x.hasOwnProperty && x.hasOwnProperty(attr)) {
      flag = false;
    }
  }
  return flag;
}
function isNumberPlus(x) {
  return /^\d+$/gi.test(x);
}
function isPromise(x) {
  return isDef(x) && isFunction(x.then) && isFunction(x.catch);
}
function isValidArrIndex(x) {
  return isDef(x) && x >= 0;
}
function isServer() {
  return typeof window === "undefined";
}

// utils/helpers/share.ts
function noop(..._args) {
}
function genAnyBackFunc(t) {
  return () => t;
}
function validPath(path, pathOrigin) {
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
function pathResolve(path) {
  let pathResolve2 = [];
  if (isString(path) || isNumber(path)) {
    pathResolve2 = String(path).split(".");
  } else if (isArray(path)) {
    if (path.length === 0)
      return pathResolve2;
    const flatPath = path.filter((i) => isString(i) || isNumber(i)).map((i) => String(i)).reduce((cur, next) => `${cur}.${next}`);
    pathResolve2 = flatPath.split(".");
  }
  return validPath(pathResolve2, path) ? pathResolve2 : [];
}

// utils/helpers/get.ts
function get(source, path, alterValue, judgeFn) {
  if (isUndef(source)) {
    if (alterValue === void 0) {
      console.error(`input(${source}) and alter(${alterValue}) can not be undefined together`);
    }
    return alterValue;
  }
  const pathOut = pathResolve(path).filter((i) => !isUndef(i) && i !== "");
  if (pathOut.length === 0) {
    if (isUndef(alterValue)) {
      return source;
    } else {
      return alterValue;
    }
  }
  let result;
  for (let i = 0; i < pathOut.length; i++) {
    const curPath = pathOut[i];
    const out = i === 0 ? source[curPath] : result[curPath];
    if (isUndef(out) || judgeFn && judgeFn(out)) {
      result = alterValue;
      break;
    } else {
      result = out;
    }
  }
  return result;
}

// utils/helpers/set.ts
function set(obj, path, value, useType) {
  if (isUndef(obj)) {
    return new Error(`undefined null is not allowed`);
  }
  const pathOut = pathResolve(path);
  if (pathOut.length === 0) {
    return obj;
  }
  pathOut.reduce((cur, next, index) => {
    const isEnd = index === pathOut.length - 1;
    if (isEnd) {
      return cur[next] = value;
    }
    if (isUndef(cur[next])) {
      return cur[next] = useType ? useType === "array" ? [] : {} : isNumberPlus(pathOut[index + 1]) ? [] : {};
    } else {
      return cur[next];
    }
  }, obj);
  return obj;
}

// utils/helpers/getParam.ts
function getParam(items, before = (dataArr) => dataArr.reduce(
  (cur, next) => ({ ...next, ...cur }),
  /* @__PURE__ */ Object.create(null)
)) {
  const len = items.length;
  let valid = true;
  const dataResult = [];
  const falseResolve = (resolve) => {
    resolve({ valid: false, param: {} });
  };
  const commonBack = (resolve) => {
    resolve({ valid, param: before(dataResult) });
  };
  const isPartialT = (x) => {
    if (x.fetch === void 0 && isObject(x)) {
      return true;
    }
    return false;
  };
  const validCalls = (resolve, data, calls) => {
    return new Promise((res) => {
      const result = calls(data, before(dataResult), dataResult);
      if (isPromise(result)) {
        result.then((val) => res(valid = val)).catch((error) => {
          console.error(error);
          falseResolve(resolve);
        });
      } else {
        res(valid = result);
      }
    });
  };
  return new Promise((resolve) => {
    const next = (step) => {
      const cur = items[step];
      if (step === len) {
        commonBack(resolve);
      }
      if (!isUndef(cur)) {
        let calls = () => true;
        let async = false;
        let fetch;
        if (isFunction(cur) || isPartialT(cur)) {
          fetch = cur;
        } else {
          ({ fetch, async = async, calls = calls } = cur);
        }
        if (isUndef(fetch)) {
          falseResolve(resolve);
        }
        const invokeCalls = (resolve2, data, calls2) => {
          validCalls(resolve2, data, calls2).then((valid2) => {
            if (valid2) {
              next(step + 1);
            } else {
              commonBack(resolve2);
            }
          });
        };
        const isAsync = (async2, fetch2) => {
          if (async2 === true && isFunction(fetch2)) {
            return true;
          }
          return false;
        };
        if (isAsync(async, fetch)) {
          fetch().then((data) => {
            dataResult.push(data);
            invokeCalls(resolve, data, calls);
          }).catch((error) => {
            console.error(error);
            falseResolve(resolve);
          });
        } else if (isFunction(fetch) && !async) {
          try {
            const data = fetch();
            dataResult.push(data);
            invokeCalls(resolve, data, calls);
          } catch (error) {
            console.error(error);
            falseResolve(resolve);
          }
        } else if (isObject(fetch)) {
          dataResult.push(fetch);
          invokeCalls(resolve, fetch, calls);
        } else {
          falseResolve(resolve);
        }
      } else {
        falseResolve(resolve);
      }
    };
    next(0);
  });
}

// utils/helpers/object.ts
function transAttr(obj, maps) {
  if (!isObject(obj))
    return obj;
  for (const [key, val] of Object.entries(maps)) {
    const { alterVal, when = (_) => isUndef(_) } = val;
    if (when(obj[key])) {
      obj[key] = isFunction(alterVal) ? alterVal(obj[key]) : alterVal;
    }
  }
  return obj;
}
function toHash(arr, path, useIndex) {
  if (!isArray(arr))
    return null;
  return arr.reduce((cur, next, index) => {
    const key = get(next, path);
    if (!isDef(key)) {
      console.error(`${next} has invalid key ${key}`);
    } else {
      if (useIndex) {
        cur[key] = index;
      } else {
        cur[key] = next;
      }
    }
    return cur;
  }, {});
}
function divideArray(data, dep = 2) {
  if (!data || data.length === 0 || dep <= 0) {
    return [];
  }
  const out = [];
  let arr = [];
  for (let i = 0; i < data.length; i++) {
    const cur = data[i];
    if (arr.length < dep) {
      arr.push(cur);
      if (arr.length === dep) {
        out.push([...arr]);
        arr = [];
      } else if (i === data.length - 1 && arr.length) {
        out.push([...arr]);
      }
    }
  }
  return out;
}

// utils/helpers/genShortId.ts
function paddingLeft(padding, val) {
  return (padding + val).slice(-padding.length);
}
var BASE = 62;
var ShortId = class {
  constructor(opt) {
    __publicField(this, "opt", {
      salts: 2,
      interval: 1,
      initTime: 14603328e5,
      // prettier-ignore
      symbols: [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z"
      ]
    });
    this.opt = Object.assign(this.opt, opt || {});
  }
  toBase(decimal, base) {
    const opt = this.opt, symbols = opt.symbols;
    let conversion = "";
    if (base > symbols.length || base <= 1) {
      return false;
    }
    while (decimal >= 1) {
      conversion = symbols[decimal - base * Math.floor(decimal / base)] + conversion;
      decimal = Math.floor(decimal / base);
    }
    return base < 11 ? parseInt(conversion) : conversion;
  }
  salts() {
    const opt = this.opt;
    const salts = opt.salts || 2;
    let ret = "";
    for (let i = 0; i < salts; i++) {
      const salt = Math.floor(Math.random() * 3844);
      ret += paddingLeft("00", this.toBase(salt, BASE));
    }
    return ret;
  }
  gen() {
    const opt = this.opt;
    const interval = opt.interval;
    const initime = opt.initTime;
    const elapsed = interval > 0 ? Math.floor(((/* @__PURE__ */ new Date()).getTime() - initime) / interval) : 0, salts = this.salts();
    return elapsed === 0 ? salts : this.toBase(elapsed, BASE) + salts;
  }
};

// utils/helpers/uid.ts
function genShortId() {
  return new ShortId({
    salts: 4
  }).gen();
}
function genUid(namespace) {
  const uid = genShortId();
  if (namespace) {
    return `${namespace}_${uid}`;
  }
  return uid;
}

// utils/helpers/map.ts
function groupBy(items, keyMapper, valueMapper) {
  const group = /* @__PURE__ */ new Map();
  items.forEach((item) => {
    const key = keyMapper(item);
    const values = group.get(key) || [];
    values.push(...valueMapper(item));
    group.set(key, values);
  });
  return group;
}
function toMap(items, keyMapper, valueMapper) {
  const group = /* @__PURE__ */ new Map();
  items.forEach((item) => {
    const key = keyMapper(item);
    group.set(key, valueMapper(item));
  });
  return group;
}

// utils/helpers/useNamespace.ts
var useNamespace = () => {
  const variables = {
    namespace: "sc-echarts"
  };
  const getPrefixCls = (scope) => {
    return `${variables.namespace}-${scope}`;
  };
  return {
    variables,
    getPrefixCls
  };
};




































exports.__publicField = __publicField; exports.getType = getType; exports.isArray = isArray; exports.isString = isString; exports.isBoolean = isBoolean; exports.isNumber = isNumber; exports.isFunction = isFunction; exports.isRegExp = isRegExp; exports.isUndef = isUndef; exports.isDef = isDef; exports.isEmpty = isEmpty; exports.notEmpty = notEmpty; exports.isEmptyArray = isEmptyArray; exports.isNonEmptyArray = isNonEmptyArray; exports.isObject = isObject; exports.isEmptyObject = isEmptyObject; exports.isNumberPlus = isNumberPlus; exports.isPromise = isPromise; exports.isValidArrIndex = isValidArrIndex; exports.isServer = isServer; exports.noop = noop; exports.genAnyBackFunc = genAnyBackFunc; exports.pathResolve = pathResolve; exports.get = get; exports.set = set; exports.getParam = getParam; exports.transAttr = transAttr; exports.toHash = toHash; exports.divideArray = divideArray; exports.genShortId = genShortId; exports.genUid = genUid; exports.groupBy = groupBy; exports.toMap = toMap; exports.useNamespace = useNamespace;
