"use strict";
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
exports.default = useFetch;
var react_1 = __importDefault(require("react"));
var utils_js_1 = require("./utils.js");
function useFetch(input, init, options) {
  var inputRef = react_1.default.useRef(input);
  var initRef = react_1.default.useRef(init);
  var hasRunFetchRef = react_1.default.useRef(false);
  var hasArgsChangedRef = react_1.default.useRef(false);
  var isInitialRenderRef = react_1.default.useRef(true);
  var _a = react_1.default.useState(), data = _a[0], setData = _a[1];
  var _b = react_1.default.useState(), error = _b[0], setError = _b[1];
  var _c = react_1.default.useState(false), loading = _c[0], setLoading = _c[1];
  var trigger = react_1.default.useCallback(function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var res, json, err_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            hasRunFetchRef.current = true;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, 5, 6]);
            setLoading(true);
            setData(undefined);
            setError(undefined);
            return [
              4, /*yield*/
              fetch(
                inputRef.current,
                __assign(__assign({}, initRef.current), {
                  body: data instanceof FormData ? data : JSON.stringify(data),
                }),
              ),
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
    return (0, utils_js_1.debounce)(
      trigger,
      (options === null || options === void 0
        ? void 0
        : options.debouncedDuration) || 0,
    );
  }, [
    trigger,
    options === null || options === void 0 ? void 0 : options.debouncedDuration,
  ]);
  react_1.default.useEffect(function () {
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      hasArgsChangedRef.current = false;
    } else {
      hasArgsChangedRef.current =
        JSON.stringify(inputRef.current) !== JSON.stringify(input) ||
        JSON.stringify(initRef.current) !== JSON.stringify(init);
    }
    inputRef.current = input;
    initRef.current = init;
    if (
      ((options === null || options === void 0
        ? void 0
        : options.fetchOnRender) && !hasRunFetchRef.current) ||
      ((options === null || options === void 0
        ? void 0
        : options.fetchOnArgsChange) && hasArgsChangedRef.current)
    ) {
      debouncedTrigger(init === null || init === void 0 ? void 0 : init.body);
    }
  }, [options, input, init, debouncedTrigger]);
  return { data: data, trigger: trigger, error: error, loading: loading };
}
