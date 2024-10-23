"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.QuokkaApiMutation = exports.QuokkaApiQuery = void 0;
exports.createApi = createApi;
var QuokkaApiAction = /** @class */ (function () {
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
    QuokkaApiAction.prototype.asHook = function () {
        var _a;
        if (!this.hasSetKey) {
            throw new Error("Should set key before attempting to generate mutation hook");
        }
        return _a = {},
            _a[this.generateHook()] = this.generateParams,
            _a;
    };
    QuokkaApiAction.prototype.generateHook = function () {
        return "NOT IMPLEMENTED";
    };
    return QuokkaApiAction;
}());
var QuokkaApiQuery = /** @class */ (function (_super) {
    __extends(QuokkaApiQuery, _super);
    function QuokkaApiQuery(generateParams) {
        return _super.call(this, generateParams) || this;
    }
    QuokkaApiQuery.prototype.generateHook = function () {
        var capitalized = (this.requestName.charAt(0).toUpperCase() +
            this.requestName.slice(1));
        var hook = "use".concat(capitalized, "Query");
        this.nameOfHook = hook;
        return hook;
    };
    return QuokkaApiQuery;
}(QuokkaApiAction));
exports.QuokkaApiQuery = QuokkaApiQuery;
var QuokkaApiMutation = /** @class */ (function (_super) {
    __extends(QuokkaApiMutation, _super);
    function QuokkaApiMutation(generateParams) {
        return _super.call(this, generateParams) || this;
    }
    QuokkaApiMutation.prototype.generateHook = function () {
        var capitalized = this.requestName.charAt(0).toUpperCase() +
            this.requestName.slice(1);
        var hook = "use".concat(capitalized, "Mutation");
        this.nameOfHook = hook;
        return hook;
    };
    return QuokkaApiMutation;
}(QuokkaApiAction));
exports.QuokkaApiMutation = QuokkaApiMutation;
var QuokkaRequestBuilder = /** @class */ (function () {
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
}());
var QuokkaApi = /** @class */ (function () {
    function QuokkaApi(init) {
        this.builder = new QuokkaRequestBuilder();
        this.endpoints = init.endpoints(this.builder);
        this.apiName = init.apiName;
        this.prepareHeaders = init.prepareHeaders;
        this.baseUrl = init.baseUrl;
        this.actions = {};
    }
    QuokkaApi.prototype.processEndpoints = function () {
        var d = Object.entries(this.endpoints).reduce(function (acc, _a) {
            var key = _a[0], mutationOrQuery = _a[1];
            mutationOrQuery.setKey(key);
            var hook = mutationOrQuery.asHook();
            acc = __assign(__assign({}, acc), hook);
            return acc;
        }, {});
        this.actions = d;
    };
    return QuokkaApi;
}());
function createApi(options) {
    var api = new QuokkaApi(options);
    return api;
}
