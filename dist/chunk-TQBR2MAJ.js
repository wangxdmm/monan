"use strict";Object.defineProperty(exports, "__esModule", {value: true});











var _chunkZXFYOZYRjs = require('./chunk-ZXFYOZYR.js');

// utils/http/share.ts
var ContentTypeKey = "Content-Type";
var ContentTypeEnum = /* @__PURE__ */ ((ContentTypeEnum2) => {
  ContentTypeEnum2["JSON"] = "application/json";
  ContentTypeEnum2["FORM"] = "application/x-www-form-urlencoded";
  ContentTypeEnum2["MULTIPART"] = "multipart/form-data";
  return ContentTypeEnum2;
})(ContentTypeEnum || {});
var HandleEnum = /* @__PURE__ */ ((HandleEnum2) => {
  HandleEnum2["SUCCESS"] = "SUCCESS";
  HandleEnum2["FAIL"] = "FAIL";
  HandleEnum2["SYSTEM_ERROR"] = "SYSTEM_ERROR";
  return HandleEnum2;
})(HandleEnum || {});
var handleEnumValues = Object.values(HandleEnum);
function genContentHeader(type) {
  return {
    [ContentTypeKey]: ContentTypeEnum[type]
  };
}
var PlainKey = Symbol("Plain");

// utils/http/setupAxios.ts
var _SetupAxios = class {
  constructor(config) {
    _chunkZXFYOZYRjs.__publicField.call(void 0, this, "config");
    _chunkZXFYOZYRjs.__publicField.call(void 0, this, "instance");
    _chunkZXFYOZYRjs.__publicField.call(void 0, this, "dynamicRequestConfig", /* @__PURE__ */ new Map());
    _chunkZXFYOZYRjs.__publicField.call(void 0, this, "dynamicHanlder", /* @__PURE__ */ new Map());
    _chunkZXFYOZYRjs.__publicField.call(void 0, this, "defaultConfig", {
      autoSetting: true,
      errorFlag: "isSysError",
      dynamicHandlerIds: []
    });
    this.config = {
      ...this.defaultConfig,
      ...config
    };
    this.instance = this.config.instance;
    this.init();
  }
  init() {
    this.handleInstance(this.instance);
    if (this.config.autoSetting === true) {
      this.setConfig();
    }
  }
  // register common code handler
  registerDynamicHandler(name, fn) {
    if (_chunkZXFYOZYRjs.isDef.call(void 0, name)) {
      this.dynamicHanlder.set(name, fn);
    }
  }
  getDynamicHandler(name) {
    if (!_chunkZXFYOZYRjs.isDef.call(void 0, name)) {
      console.error(`Can not find getDynamicHandler by empty name [${name}]`);
      return;
    }
    return this.dynamicHanlder.get(name);
  }
  registerDynamicRequestConfig(name, fn, config = {
    when: true
  }) {
    if (_chunkZXFYOZYRjs.isDef.call(void 0, name)) {
      this.dynamicRequestConfig.set(name, {
        invoke: fn,
        ...config
      });
    }
  }
  getDynamicRequestConfig(name, all) {
    if (!_chunkZXFYOZYRjs.isDef.call(void 0, name)) {
      console.error(`Can not find dynamicRequestConfig by empty name [${name}]`);
      return;
    }
    const config = this.dynamicRequestConfig.get(name);
    if (config) {
      return all ? config : config.invoke;
    }
  }
  removeDynamicRequestConfig(name) {
    this.dynamicRequestConfig.delete(name);
  }
  isSysError(x) {
    return x[this.config.errorFlag] === true;
  }
  getInstance() {
    return this.instance;
  }
  setConfig() {
    if (this.config.transIns) {
      this.config.transIns(this.instance, this);
    }
  }
  handleInstance(instance) {
    instance.interceptors.request.use(
      // TODO axios bug
      this.preRequest,
      this.catchError.bind(this),
      this.getInterceptorOptions("request")
    );
    instance.interceptors.response.use(
      this.handleResponse,
      this.catchError.bind(this),
      this.getInterceptorOptions("response")
    );
  }
  get preRequest() {
    return (config) => {
      let processedConfig = config;
      this.dynamicRequestConfig.forEach((val) => {
        if (val.when === true || _chunkZXFYOZYRjs.isFunction.call(void 0, val.when) && val.when(processedConfig, this)) {
          processedConfig = val.invoke(processedConfig);
        }
      });
      if (this.config.request) {
        processedConfig = this.config.request(processedConfig, this);
      }
      return processedConfig;
    };
  }
  getInterceptorOptions(type) {
    if (this.config.interceptorOptions) {
      return this.config.interceptorOptions(type, this);
    }
  }
  get handleResponse() {
    return (result) => {
      if (this.config.response) {
        result = this.config.response(result, this);
      }
      return result;
    };
  }
  async catchError(error) {
    const code = _chunkZXFYOZYRjs.get.call(void 0, error, "response.status");
    const {
      errorFlag,
      codeHandler = [
        {
          handler: ({ back: back2 }) => back2
        }
      ]
    } = this.config;
    const back = {
      [errorFlag]: true,
      error
    };
    for (let i = 0; i < codeHandler.length; i++) {
      const { on, async, handler, id } = codeHandler[i];
      if (!on || _chunkZXFYOZYRjs.isArray.call(void 0, on) && on.includes(code) || _chunkZXFYOZYRjs.isRegExp.call(void 0, on) && on.test(String(code))) {
        if (_chunkZXFYOZYRjs.isRegExp.call(void 0, on)) {
          on.lastIndex = 0;
        }
        const params = {
          code,
          error,
          ins: this.instance,
          back: Promise.resolve({ ...back, hasHandled: true }),
          rowBack: { ...back },
          httpIns: this
        };
        if (id) {
          params.dynamicHandler = this.getDynamicHandler(id);
        }
        if (async) {
          return await handler(params);
        }
        return handler(params);
      }
    }
    return Promise.resolve(back);
  }
  useParamInject(urlIn, paramsIn, config) {
    if (paramsIn && !_chunkZXFYOZYRjs.isEmptyObject.call(void 0, paramsIn)) {
      const { __R_interParam = _SetupAxios.interParam } = config || {};
      const re = __R_interParam(urlIn, paramsIn, config == null ? void 0 : config.__R_reverse);
      return re;
    }
    return false;
  }
  normalizeRequest(urlIn, paramsIn, config) {
    let url = urlIn;
    let dataOrParams = paramsIn || {};
    const result = this.useParamInject(urlIn, paramsIn, config);
    if (result) {
      url = result.url;
      dataOrParams = result.data;
    }
    return {
      url,
      dataOrParams
    };
  }
};
var SetupAxios = _SetupAxios;
// 解析 path 中的参数选项
_chunkZXFYOZYRjs.__publicField.call(void 0, SetupAxios, "interParam", function(urlIn, dataIn, reserve = false) {
  let url = urlIn;
  const data = _chunkZXFYOZYRjs.isObject.call(void 0, dataIn) ? { ...dataIn } : dataIn;
  const matchs = url.match(/{([^/.]+)}/g);
  if (matchs == null ? void 0 : matchs.length) {
    matchs.forEach((param) => {
      const key = param.replace(/[{}]/gi, "");
      url = url.replace(param, String(data[key]));
      if (!reserve) {
        delete data[key];
      }
    });
  }
  return { url, data };
});

// utils/http/restful.ts
var Restful = class extends SetupAxios {
  constructor() {
    super(...arguments);
    _chunkZXFYOZYRjs.__publicField.call(void 0, this, "genHandleFunc");
    _chunkZXFYOZYRjs.__publicField.call(void 0, this, "defaultStrategies", {});
  }
  createDefaultStrategies(strategiesCreator) {
    Object.assign(this.defaultStrategies, strategiesCreator(this));
  }
  get defaultIsSuccess() {
    return this.defaultStrategies["isSuccess"] || _chunkZXFYOZYRjs.noop;
  }
  get defaultGetBackData() {
    return this.defaultStrategies["getBackData"] || _chunkZXFYOZYRjs.noop;
  }
  get defaualtGetMessage() {
    return this.defaultStrategies["getMessage"] || _chunkZXFYOZYRjs.noop;
  }
  get showErrorMessageTip() {
    return this.defaultStrategies["showErrorMessageTip"] || _chunkZXFYOZYRjs.noop;
  }
  get showSuccessMessageTip() {
    return this.defaultStrategies["showSuccessMessageTip"] || _chunkZXFYOZYRjs.noop;
  }
  updateHandleFunc(fn) {
    this.genHandleFunc = fn;
  }
  parseDef(def) {
    const valueDiv = "->";
    const meta = {};
    let [method, url, metaStr] = def.split("::");
    let id = "";
    if (!method) {
      console.error(`${def} must have method: please check https://github.com/axios/axios`);
      return;
    }
    method = method.toLowerCase();
    if (method.includes("(")) {
      method = method.slice(0, -2);
      meta.noArgs = true;
    }
    if (url) {
      [url, id] = url.split(valueDiv);
      if (url.slice(-1) === "?") {
        meta.makeInputAsParams = true;
        url = url.slice(0, -1);
      }
      if (!id) {
        id = url.split("/").pop();
      }
      if (!id) {
        console.error(
          `We default use last word in path like: "a/b/c" we will use c as id, or "a/b/c->alterName" we will use alterName as id, but there is nothing in ${def}, Please check the rule.`
        );
        return;
      }
    }
    if (metaStr) {
      metaStr.split(",").forEach((m) => {
        const [k, v = true] = m.split(valueDiv);
        meta[k] = v;
      });
    }
    if (!["put", "post", "delete", "patch"].includes(method)) {
      meta.makeInputAsParams = true;
    }
    return {
      id,
      url,
      method,
      meta
    };
  }
  patchConfigByMeta(userInputData, config, meta) {
    const configed = config || {};
    if (meta) {
      let contentType;
      const { timeout, makeInputAsParams: params, responseType } = meta;
      if (meta.contentType) {
        contentType = meta.contentType.toUpperCase();
      }
      if (contentType && !_chunkZXFYOZYRjs.get.call(void 0, configed, ["headers", ContentTypeKey])) {
        ContentTypeEnum[contentType] && _chunkZXFYOZYRjs.set.call(void 0, configed, ["headers", ContentTypeKey], ContentTypeEnum[contentType]);
      }
      if (params && !configed.params) {
        _chunkZXFYOZYRjs.set.call(void 0, configed, "params", userInputData);
      }
      if (!params && !configed.data) {
        _chunkZXFYOZYRjs.set.call(void 0, configed, "data", userInputData);
      }
      if (timeout && !configed.timeout) {
        _chunkZXFYOZYRjs.set.call(void 0, configed, "timeout", parseInt(timeout, 10));
      }
      if (responseType && !configed.responseType) {
        _chunkZXFYOZYRjs.set.call(void 0, configed, "responseType", responseType);
      }
    } else if (!configed.data) {
      _chunkZXFYOZYRjs.set.call(void 0, configed, "data", userInputData);
    }
    return configed;
  }
  create(prefix, defs) {
    const result = {};
    defs.forEach((def) => {
      const defMes = this.parseDef(def);
      if (defMes && defMes.id) {
        const { method, id, url: urlDef, meta } = defMes;
        result[id] = (...args) => {
          let config;
          let userInputData;
          if (meta == null ? void 0 : meta.noArgs) {
            config = args[0];
          } else {
            config = args[1];
            userInputData = args[0];
          }
          const { url, dataOrParams } = this.normalizeRequest(urlDef, userInputData, config);
          config = this.patchConfigByMeta(dataOrParams, config, meta);
          config.url = `${prefix}${url}`;
          config.method = method;
          return this.genHandleFunc(this.instance(config));
        };
      }
    });
    return result;
  }
};

// utils/http/deprecatedRestful.ts
var DeprecatedRestful = class extends Restful {
  /**@deprecated please use this.instance(getConfig) or create to generate api you want*/
  get(urlIn, params, config) {
    const { url, dataOrParams } = this.normalizeRequest(urlIn, params, config);
    return this.instance.get(url, {
      params: dataOrParams,
      ...config
    });
  }
  /**@deprecated please use this.instance(deleteConfig) or create to generate api you want*/
  delete(urlIn, body, config) {
    const { url, dataOrParams } = this.normalizeRequest(urlIn, body, config);
    return this.instance.delete(url, {
      data: dataOrParams,
      ...config
    });
  }
  /**@deprecated please use this.instance(postConfig) or create to generate api you want*/
  post(urlIn, body, config) {
    const { url, dataOrParams } = this.normalizeRequest(urlIn, body, config);
    return this.instance.post(url, dataOrParams, {
      ...config
    });
  }
  /**@deprecated please use this.instance(putConfig) or create to generate api you want*/
  put(urlIn, body, config) {
    const { url, dataOrParams } = this.normalizeRequest(urlIn, body, config);
    return this.instance.put(url, dataOrParams, {
      ...config
    });
  }
  /**@deprecated please use this.instance(patchConfig) or create to generate api you want*/
  patch(urlIn, body, config) {
    const { url, dataOrParams } = this.normalizeRequest(urlIn, body, config);
    return this.instance.patch(url, dataOrParams, {
      ...config
    });
  }
};

// utils/http/response.ts
var mesSort = ["SUCCESS" /* SUCCESS */, "FAIL" /* FAIL */, "SYSTEM_ERROR" /* SYSTEM_ERROR */];
function genHandleResponse(http) {
  function isSysError(x) {
    return http.isSysError(x);
  }
  function handleResponse(res, configIn) {
    const config = Object.assign(
      {
        isSuccess: http.defaultIsSuccess,
        getBackData: http.defaultGetBackData,
        getMessage: http.defaualtGetMessage
      },
      configIn || {}
    );
    const { getBackData, getMessage, isSuccess } = config;
    const resResult = {
      result: isSysError(res) ? false : isSuccess(res),
      notify: () => ({}),
      response: isSysError(res) ? res.error.response : res
    };
    const { result } = resResult;
    if (isSysError(res)) {
      resResult.sysError = getBackData("SYSTEM_ERROR" /* SYSTEM_ERROR */, res);
      resResult.message = getMessage("SYSTEM_ERROR" /* SYSTEM_ERROR */, res);
    } else {
      if (!result) {
        resResult.error = res.data;
        resResult.message = getMessage("FAIL" /* FAIL */, res);
      } else {
        resResult.backData = getBackData("SUCCESS" /* SUCCESS */, res);
        resResult.message = getMessage("SUCCESS" /* SUCCESS */, res);
        resResult.wholeData = res.data;
      }
    }
    resResult.notify = (messageOrOptions) => {
      const { sysError, result: result2 } = resResult;
      if (sysError && sysError.hasHandled) {
        return;
      }
      const mesHash = handleEnumValues.reduce((cur, next) => {
        cur[next] = {};
        return cur;
      }, {});
      if (_chunkZXFYOZYRjs.isObject.call(void 0, messageOrOptions)) {
        handleEnumValues.forEach((mes) => {
          const cur = messageOrOptions[mes];
          if (_chunkZXFYOZYRjs.isObject.call(void 0, cur)) {
            Object.assign(mesHash[mes], cur);
          } else if (_chunkZXFYOZYRjs.isString.call(void 0, cur)) {
            mesHash[mes].message = mes;
          }
        });
      } else if (_chunkZXFYOZYRjs.isString.call(void 0, messageOrOptions)) {
        mesHash["SUCCESS" /* SUCCESS */].message = messageOrOptions;
      } else if (_chunkZXFYOZYRjs.isArray.call(void 0, messageOrOptions)) {
        mesSort.forEach((k, index) => {
          if (messageOrOptions[index] !== void 0) {
            mesHash[k].message = messageOrOptions[index];
          }
        });
      }
      const getMessage2 = (index) => Object.assign({ message: resResult.message }, mesHash[index]);
      if (sysError) {
        http.showErrorMessageTip(getMessage2("SYSTEM_ERROR" /* SYSTEM_ERROR */));
      } else {
        result2 ? http.showSuccessMessageTip(getMessage2("SUCCESS" /* SUCCESS */)) : http.showErrorMessageTip(getMessage2("FAIL" /* FAIL */));
      }
    };
    if (!config.notificationDelay && resResult.message !== void 0) {
      resResult.notify();
    }
    return resResult;
  }
  function genHandleFunc(response) {
    return async (config) => handleResponse(await response, config);
  }
  http.updateHandleFunc(genHandleFunc);
  return {
    isSysError,
    handleResponse,
    genHandleFunc
  };
}

// utils/http/defineEasyAxios.ts
function defineEasyAxios(options, useDeprecatedFeatures) {
  const http = useDeprecatedFeatures ? new DeprecatedRestful(options) : new Restful(options);
  return {
    http,
    ...genHandleResponse(http)
  };
}












exports.ContentTypeKey = ContentTypeKey; exports.ContentTypeEnum = ContentTypeEnum; exports.HandleEnum = HandleEnum; exports.handleEnumValues = handleEnumValues; exports.genContentHeader = genContentHeader; exports.PlainKey = PlainKey; exports.SetupAxios = SetupAxios; exports.Restful = Restful; exports.DeprecatedRestful = DeprecatedRestful; exports.defineEasyAxios = defineEasyAxios;
