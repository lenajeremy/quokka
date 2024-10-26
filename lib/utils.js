"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounce = debounce;
exports.identifierToHook = identifierToHook;
exports.resolveRequestParameters = resolveRequestParameters;
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
function identifierToHook(identifier) {
  var capitalized = identifier.charAt(0).toUpperCase() + identifier.slice(1);
  return "use".concat(capitalized, "Query");
}
function isQueryParams(p) {
  return Object.hasOwn(p, "body") === false;
}
function resolveUrl(baseUrl, path, params) {
  // combining the urls need some work
  var url = new URL(
    (baseUrl.endsWith("/") ? baseUrl.slice(0, baseUrl.length - 1) : baseUrl) +
      (path.startsWith("/") ? path : "/".concat(path)),
  );
  Object.entries(params || {}).forEach(function (entry) {
    url.searchParams.set(entry[0], entry[1]);
  });
  return url.toString();
}
function mergeHeaders(headers, into) {
  /// the more recent headers should take preference and
  /// overwrite the content of the least recently added onces
  /// This means that the order of hierarchy is left to right
  for (var _i = 0, headers_1 = headers; _i < headers_1.length; _i++) {
    var h = headers_1[_i];
    h === null || h === void 0 ? void 0 : h.forEach(function (value, key) {
      into.set(key, value);
    });
  }
  return into;
}
function resolveRequestParameters(apiInit, endpointParams) {
  // resolve url
  var url = resolveUrl(
    apiInit.baseUrl,
    endpointParams.url,
    endpointParams.params,
  );
  console.log(apiInit, endpointParams);
  // resolve headers
  var headers = new Headers();
  if (apiInit.prepareHeaders) {
    mergeHeaders([
      apiInit.prepareHeaders({}, new Headers()),
      endpointParams.headers,
    ], headers);
  } else {
    mergeHeaders([endpointParams.headers], headers);
  }
  if (isQueryParams(endpointParams)) {
    return {
      url: url,
      headers: headers,
      method: endpointParams.method,
      params: endpointParams.params,
    };
  } else {
    return {
      url: url,
      headers: headers,
      method: endpointParams.method,
      params: endpointParams.params,
      body: endpointParams.body,
    };
  }
}
