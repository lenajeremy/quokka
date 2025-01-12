"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuokkaRequestBuilder = void 0;
var api_mutation_1 = require("./api-mutation");
var api_query_1 = require("./api-query");
var QuokkaRequestBuilder = /** @class */ (function () {
    function QuokkaRequestBuilder(api) {
        this.api = api;
        this.query = function (val, options) {
            return new api_query_1.QuokkaApiQuery(val, this.api, options);
        };
        this.mutation = function (val, options) {
            return new api_mutation_1.QuokkaApiMutation(val, this.api, options);
        };
    }
    return QuokkaRequestBuilder;
}());
exports.QuokkaRequestBuilder = QuokkaRequestBuilder;
