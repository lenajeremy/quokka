"use strict";
var __extends = (this && this.__extends) || (function () {
  var extendStatics = function (d, b) {
    extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) {
        d.__proto__ = b;
      }) ||
      function (d, b) {
        for (var p in b) {
          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        }
      };
    return extendStatics(d, b);
  };
  return function (d, b) {
    if (typeof b !== "function" && b !== null) {
      throw new TypeError(
        "Class extends value " + String(b) + " is not a constructor or null",
      );
    }
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null
      ? Object.create(b)
      : (__.prototype = b.prototype, new __());
  };
})();
var __assign = (this && this.__assign) || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) {
          t[p] = s[p];
        }
      }
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function (resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator = (this && this.__generator) || function (thisArg, body) {
  var _ = {
      label: 0,
      sent: function () {
        if (t[0] & 1) throw t[1];
        return t[1];
      },
      trys: [],
      ops: [],
    },
    f,
    y,
    t,
    g = Object.create(
      (typeof Iterator === "function" ? Iterator : Object).prototype,
    );
  return g.next = verb(0),
    g["throw"] = verb(1),
    g["return"] = verb(2),
    typeof Symbol === "function" && (g[Symbol.iterator] = function () {
      return this;
    }),
    g;
  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (g && (g = 0, op[0] && (_ = 0)), _) {
      try {
        if (
          f = 1,
            y && (t = op[0] & 2
              ? y["return"]
              : op[0]
              ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
              : y.next) &&
            !(t = t.call(y, op[1])).done
        ) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (
              !(t = _.trys, t = t.length > 0 && t[t.length - 1]) &&
              (op[0] === 6 || op[0] === 2)
            ) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2]) _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }
    if (op[0] & 5) throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuokkaApi =
  exports.QuokkaRequestBuilder =
  exports.QuokkaApiMutation =
  exports.QuokkaApiQuery =
  exports.QuokkaApiAction =
    void 0;
exports.createApi = createApi;
var react_1 = __importDefault(require("react"));
var utils_1 = require("./utils");
var QuokkaApiAction = /** @class */ function () {
  function QuokkaApiAction(generateParams) {
    this.requestName = "";
    this.hasSetKey = false;
    this.generateParams = generateParams;
  }
  QuokkaApiAction.prototype.setKey = function (key) {
    if (!this.hasSetKey) {
      this.requestName = key;
      this.hasSetKey = true;
    }
  };
  QuokkaApiAction.prototype.asHook = function (apiInit) {
    var _a;
    if (!this.hasSetKey) {
      throw new Error(
        "Should set key before attempting to generate mutation hook",
      );
    }
    return _a = {},
      _a[this.generateHookName()] = this.generateHook(
        this.generateParams,
        apiInit,
      ),
      _a;
  };
  QuokkaApiAction.prototype.generateHookName = function () {
    return "NOT IMPLEMENTED";
  };
  QuokkaApiAction.prototype.generateHook = function (params, apiInit) {
    return "NOT IMPLEMENTED";
  };
  return QuokkaApiAction;
}();
exports.QuokkaApiAction = QuokkaApiAction;
var QuokkaApiQuery = /** @class */ function (_super) {
  __extends(QuokkaApiQuery, _super);
  function QuokkaApiQuery(generateParams) {
    return _super.call(this, generateParams) || this;
  }
  QuokkaApiQuery.prototype.generateHookName = function () {
    var capitalized = this.requestName.charAt(0).toUpperCase() +
      this.requestName.slice(1);
    var hook = "use".concat(capitalized, "Query");
    this.nameOfHook = hook;
    return hook;
  };
  QuokkaApiQuery.prototype.generateHook = function (params, apiInit) {
    function useQuery(args, options) {
      var initRef = react_1.default.useRef(params(args));
      var hasRunFetchRef = react_1.default.useRef(false);
      var hasArgsChangedRef = react_1.default.useRef(false);
      var isInitialRenderRef = react_1.default.useRef(true);
      var _a = react_1.default.useState(), data = _a[0], setData = _a[1];
      var _b = react_1.default.useState(), error = _b[0], setError = _b[1];
      var _c = react_1.default.useState(false),
        loading = _c[0],
        setLoading = _c[1];
      var trigger = react_1.default.useCallback(function (data) {
        return __awaiter(this, void 0, void 0, function () {
          var requestParams, requestParamsWithData, res, json, err_1;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                requestParams = (0, utils_1.resolveRequestParameters)(
                  apiInit,
                  initRef.current,
                );
                requestParamsWithData = __assign(
                  __assign({}, requestParams),
                  params(data),
                );
                _a.label = 1;
              case 1:
                _a.trys.push([1, 4, 5, 6]);
                setLoading(true);
                setData(undefined);
                setError(undefined);
                return [
                  4, /*yield*/
                  fetch(requestParamsWithData.url, {
                    method: requestParamsWithData.method,
                    headers: requestParamsWithData.headers,
                  }),
                ];
              case 2:
                res = _a.sent();
                return [4, /*yield*/ res.json()];
              case 3:
                json = _a.sent();
                if (res.ok) {
                  setData(json);
                  return [2, /*return*/ json];
                } else {
                  throw json;
                }
                return [3, /*break*/ 6];
              case 4:
                err_1 = _a.sent();
                setError(err_1);
                throw err_1;
              case 5:
                setLoading(false);
                return [7 /*endfinally*/];
              case 6:
                return [2 /*return*/];
            }
          });
        });
      }, []);
      var debouncedTrigger = react_1.default.useMemo(function () {
        return (0, utils_1.debounce)(
          trigger,
          (options === null || options === void 0
            ? void 0
            : options.debouncedDuration) || 0,
        );
      }, [
        trigger,
        options === null || options === void 0
          ? void 0
          : options.debouncedDuration,
      ]);
      react_1.default.useEffect(function () {
        if (isInitialRenderRef.current) {
          isInitialRenderRef.current = false;
          hasArgsChangedRef.current = false;
        } else {
          hasArgsChangedRef.current =
            JSON.stringify(initRef.current) !== JSON.stringify(params(args));
        }
        initRef.current = params(args);
        if (
          ((options === null || options === void 0
            ? void 0
            : options.fetchOnRender) && !hasRunFetchRef.current) ||
          ((options === null || options === void 0
            ? void 0
            : options.fetchOnArgsChange) && hasArgsChangedRef.current)
        ) {
          debouncedTrigger(args);
          hasRunFetchRef.current = true;
        }
      }, [options, debouncedTrigger, args]);
      return { data: data, trigger: trigger, error: error, loading: loading };
    }
    return useQuery;
  };
  return QuokkaApiQuery;
}(QuokkaApiAction);
exports.QuokkaApiQuery = QuokkaApiQuery;
var QuokkaApiMutation = /** @class */ function (_super) {
  __extends(QuokkaApiMutation, _super);
  function QuokkaApiMutation(generateParams) {
    return _super.call(this, generateParams) || this;
  }
  QuokkaApiMutation.prototype.generateHookName = function () {
    var capitalized = this.requestName.charAt(0).toUpperCase() +
      this.requestName.slice(1);
    var hook = "use".concat(capitalized, "Mutation");
    this.nameOfHook = hook;
    return hook;
  };
  return QuokkaApiMutation;
}(QuokkaApiAction);
exports.QuokkaApiMutation = QuokkaApiMutation;
var QuokkaRequestBuilder = /** @class */ function () {
  function QuokkaRequestBuilder() {
    this.query = function (val) {
      var newQuery = new QuokkaApiQuery(val);
      return newQuery;
    };
    this.mutation = function (val) {
      var newMutation = new QuokkaApiMutation(val);
      return newMutation;
    };
  }
  return QuokkaRequestBuilder;
}();
exports.QuokkaRequestBuilder = QuokkaRequestBuilder;
var QuokkaApi = /** @class */ function () {
  function QuokkaApi(init) {
    this.builder = new QuokkaRequestBuilder();
    this.endpoints = init.endpoints(this.builder);
    this.apiName = init.apiName;
    this.prepareHeaders = init.prepareHeaders;
    this.baseUrl = init.baseUrl;
    this.actions = {};
    this.processEndpoints();
  }
  QuokkaApi.prototype.processEndpoints = function () {
    var _this = this;
    var d = Object.entries(this.endpoints).reduce(function (acc, _a) {
      var key = _a[0], mutationOrQuery = _a[1];
      mutationOrQuery.setKey(key);
      var hook = mutationOrQuery.asHook({
        baseUrl: _this.baseUrl,
        apiName: _this.apiName,
        prepareHeaders: _this.prepareHeaders,
      });
      acc = __assign(__assign({}, acc), hook);
      return acc;
    }, {});
    this.actions = d;
  };
  return QuokkaApi;
}();
exports.QuokkaApi = QuokkaApi;
function createApi(options) {
  var api = new QuokkaApi(options);
  return api;
}
