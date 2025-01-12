"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounce = debounce;
exports.resolveRequestParameters = resolveRequestParameters;
exports.generateRequestKey = generateRequestKey;
exports.hasMatchingTags = hasMatchingTags;
function debounce(fn, ms) {
    var timer;
    return function () {
        var _this = this;
        var args = arguments;
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            // @ts-expect-error
            fn.apply(_this, args);
        }, ms);
    };
}
function isQueryParams(p) {
    return !Object.hasOwn(p, "body");
}
function resolveUrl(baseUrl, path, params) {
    // combining the urls need some work
    var url = new URL((baseUrl.endsWith("/") ? baseUrl.slice(0, baseUrl.length - 1) : baseUrl) +
        (path.startsWith("/") ? path : "/".concat(path)));
    Object.entries(params || {}).forEach(function (entry) {
        url.searchParams.set(entry[0], entry[1]);
    });
    return url.toString();
}
/**
 * `mergeHeaders` merges a list of `Header`s into another `Header`. The most recent header takes preference and
 * overwrites the content of the least recently added ones.
 *
 * This means that the order of hierarchy is left to right. The headers closer to the right of the array overrides
 * the values of preceding headers
 * */
function mergeHeaders(headers, into) {
    for (var _i = 0, headers_1 = headers; _i < headers_1.length; _i++) {
        var h = headers_1[_i];
        h === null || h === void 0 ? void 0 : h.forEach(function (value, key) {
            into.set(key, value);
        });
    }
    return into;
}
/**
 * `resolveRequestParameters` merge request params from a single request with those
 * from the parent api from which it's defined.
 *
 * Use cases:
 *
 * - Merging headers set in the api with new headers specific to a single request.
 * - Merging search params
 */
function resolveRequestParameters(apiInit, endpointParams, getState) {
    // resolve url
    var url = resolveUrl(apiInit.baseUrl, endpointParams.url, endpointParams.params);
    // resolve headers
    var headers = new Headers();
    headers.set("content-type", "application/json");
    if (apiInit.prepareHeaders) {
        mergeHeaders([
            apiInit.prepareHeaders(getState, new Headers()),
            endpointParams.headers,
        ], headers);
    }
    else {
        mergeHeaders([endpointParams.headers], headers);
    }
    if (isQueryParams(endpointParams)) {
        return {
            url: url,
            headers: headers,
            method: endpointParams.method,
            params: endpointParams.params,
        };
    }
    else {
        return {
            url: url,
            headers: headers,
            method: endpointParams.method,
            params: endpointParams.params,
            body: endpointParams.body,
        };
    }
}
/**
 * `generateRequestKey` generates a unique key for a particular request using the request parameters.
 *
 * This helps to dedupe request by ensuring that requests with the same parameters (body, url, method, etc.)
 * are resolved to the same key.
 * */
function generateRequestKey(requestParams) {
    return __awaiter(this, void 0, void 0, function () {
        var sortedParams;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sortedParams = sortKeys(__assign({}, requestParams));
                    return [4 /*yield*/, generateSHA256Hash(JSON.stringify(sortedParams))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * `sortKeys` takes an object, and returns a new object with the keys in sorted order.
 *
 * It recursively sorts the keys of the child objects as well. This helps so that request
 * parameters would always have the same form so they are dedupe correctly.
 *
 * Examples:
 * ```javascript
 * const obj1 = {name: "Jeremiah", age: "22", company: "Meta"}
 * const obj2 = {company: "Meta", name: 'Jeremiah', age: "22"}
 *
 * const sortedObj1 = sortKeys(obj1)
 * console.log(sortedObj1)  // {age: "22", company: "Meta", name: "Jeremiah"}
 *
 * const sortedObj2 = sortKeys(obj2)
 * console.log(sortedObj2)  // {age: "22", company: "Meta", name: "Jeremiah"}
 *
 * deepCompare(sortedObj1, sortedObj2) // true
 * ```
 * */
function sortKeys(obj) {
    if (Array.isArray(obj)) {
        return obj.map(sortKeys);
    }
    else if (isObject(obj)) {
        return Object.keys(obj)
            .sort()
            .reduce(function (acc, key) {
            acc[key] = sortKeys(obj[key]);
            return acc;
        }, {});
    }
    else {
        return obj;
    }
}
function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}
/**
 * `generateSHA256Hash` generates a unique hash provided a string.
 * */
function generateSHA256Hash(message) {
    return __awaiter(this, void 0, void 0, function () {
        var encoder, data, hashBuffer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    encoder = new TextEncoder();
                    data = encoder.encode(message);
                    return [4 /*yield*/, crypto.subtle.digest('SHA-256', data)];
                case 1:
                    hashBuffer = _a.sent();
                    return [2 /*return*/, Array.from(new Uint8Array(hashBuffer))
                            .map(function (byte) { return byte.toString(16).padStart(2, '0'); })
                            .join('')];
            }
        });
    });
}
function hasMatchingTags(mTags, qTags) {
    if (!mTags || !qTags)
        return false;
    if (!(mTags || qTags) || (mTags.length == 0 && qTags.length == 0))
        return true;
    for (var _i = 0, mTags_1 = mTags; _i < mTags_1.length; _i++) {
        var mTag = mTags_1[_i];
        for (var _a = 0, qTags_1 = qTags; _a < qTags_1.length; _a++) {
            var qTag = qTags_1[_a];
            if (deepCompare(mTag instanceof Function ? mTag() : mTag, qTag instanceof Function ? qTag() : qTag)) {
                return true;
            }
        }
    }
    return false;
}
function deepCompare(obj1, obj2) {
    if (!obj1 || !obj2 || typeof obj2 !== 'object' || typeof obj1 !== 'object') {
        return obj1 === obj2;
    }
    if (Array.isArray(obj1)) {
        if (Array.isArray(obj2)) {
            if (obj1.length !== obj2.length) {
                return false;
            }
            for (var i = 0; i < obj1.length; i++) {
                if (!deepCompare(obj1[i], obj2[i])) {
                    return false;
                }
            }
        }
        else {
            return false;
        }
    }
    else {
        if (Array.isArray(obj2)) {
            return false;
        }
        if (Object.keys(obj2).length !== Object.keys(obj1).length) {
            return false;
        }
        for (var _i = 0, _a = Object.keys(obj1); _i < _a.length; _i++) {
            var key = _a[_i];
            // @ts-ignore
            if (!deepCompare(obj1[key], obj2[key])) {
                return false;
            }
        }
    }
    return true;
}
