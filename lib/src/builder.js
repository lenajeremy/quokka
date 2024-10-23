"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useInitializeUserAccountQuery = exports.useFetchDashboardDataQuery = exports.usePostNotificationsQuery = void 0;
exports.createBuilder = createBuilder;
var utils_js_1 = require("./utils.js");
function createBuilder(options) {
    var optionsAsHook = Object.entries(options).reduce(function (acc, _a) {
        var identifier = _a[0], fn = _a[1];
        var functionAsHook = (0, utils_js_1.identifierToHook)(identifier);
        acc[functionAsHook] = fn;
        return acc;
    }, {});
    return optionsAsHook;
}
var stuff = createBuilder({
    postNotifications: function (val) {
        console.log(val);
        return true;
    },
    fetchDashboardData: function (name) {
        if (name == "jeremiah") {
            return true;
        }
        return false;
    },
    initializeUserAccount: function (yearOfBirth) {
        return new Date().getFullYear() - yearOfBirth;
    },
});
exports.usePostNotificationsQuery = stuff.usePostNotificationsQuery, exports.useFetchDashboardDataQuery = stuff.useFetchDashboardDataQuery, exports.useInitializeUserAccountQuery = stuff.useInitializeUserAccountQuery;
