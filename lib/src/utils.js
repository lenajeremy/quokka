"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounce = debounce;
exports.identifierToHook = identifierToHook;
function debounce(fn, seconds) {
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
    }, seconds * 1000);
  };
}
function identifierToHook(identifier) {
  var capitalized = identifier.charAt(0).toUpperCase() + identifier.slice(1);
  return "use".concat(capitalized, "Query");
}
