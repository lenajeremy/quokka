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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuokkaApi = void 0;
var request_builder_1 = require("./request-builder");
var api_query_1 = require("./api-query");
var QuokkaApi = /** @class */ (function () {
    function QuokkaApi(init) {
        this.builder = new request_builder_1.QuokkaRequestBuilder(this);
        this.endpoints = init.endpoints(this.builder);
        this.apiName = init.apiName;
        this.prepareHeaders = init.prepareHeaders;
        this.baseUrl = init.baseUrl;
        this.actions = {};
        this.tags = init.tags;
        this.queries = {};
        this.mutations = {};
        this.processEndpoints();
    }
    QuokkaApi.prototype.processEndpoints = function () {
        var _this = this;
        this.actions = Object.entries(this.endpoints).reduce(function (acc, _a) {
            var key = _a[0], mutationOrQuery = _a[1];
            mutationOrQuery.setKey(key);
            if (mutationOrQuery instanceof api_query_1.QuokkaApiQuery) {
                _this.queries[key] = mutationOrQuery;
            }
            else {
                _this.mutations[key] = mutationOrQuery;
            }
            var hook = mutationOrQuery.asHook({
                baseUrl: _this.baseUrl,
                apiName: _this.apiName,
                prepareHeaders: _this.prepareHeaders,
            });
            acc = __assign(__assign({}, acc), hook);
            return acc;
        }, {});
    };
    return QuokkaApi;
}());
exports.QuokkaApi = QuokkaApi;
