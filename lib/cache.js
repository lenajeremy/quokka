"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManager = exports.CacheEntry = void 0;
var utils_1 = require("./utils");
var CacheEntry = /** @class */ (function () {
    function CacheEntry(id, name, params, payload, result, tags) {
        this.id = id;
        this.name = name;
        this.result = result;
        this.payload = payload;
        this.tags = tags;
        this.params = params;
        this.isValid = true;
    }
    return CacheEntry;
}());
exports.CacheEntry = CacheEntry;
var CacheManager = /** @class */ (function () {
    function CacheManager() {
        this._apis = {};
    }
    Object.defineProperty(CacheManager.prototype, "apis", {
        get: function () {
            return this._apis;
        },
        enumerable: false,
        configurable: true
    });
    CacheManager.prototype.get = function (apiName, nameOfHook, key, tags) {
        if (!this._apis[apiName])
            return;
        var entry = this._apis[apiName].find(function (entry) { return (entry.name === nameOfHook &&
            entry.id === key &&
            (0, utils_1.hasMatchingTags)(tags, entry.tags) &&
            entry.isValid); });
        if (!entry)
            return;
        return entry.result;
    };
    CacheManager.prototype.update = function (apiName, nameOfHook, key, tags, data, params, payload) {
        if (!this._apis[apiName]) {
            this._apis[apiName] = [];
        }
        var entryIndex = this._apis[apiName].findIndex(function (entry) { return (entry.name === nameOfHook &&
            entry.id === key &&
            (0, utils_1.hasMatchingTags)(tags, entry.tags)); });
        if (entryIndex === -1) {
            var entry = new CacheEntry(key, nameOfHook, params, payload, data, tags);
            this._apis[apiName].push(entry);
        }
        else {
            this._apis[apiName].at(entryIndex).result = data;
        }
    };
    return CacheManager;
}());
exports.CacheManager = CacheManager;
