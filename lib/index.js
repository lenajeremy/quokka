"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApi = createApi;
var quokka_api_1 = require("./models/quokka-api");
function createApi(options) {
    return new quokka_api_1.QuokkaApi(options);
}
