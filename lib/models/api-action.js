"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuokkaApiAction = void 0;
/**
 * `QuokkaApiAction` is the abstract class from which `QuokkaApiQuery` and `QuokkaApiMutation` classes inherit.
 * It describes the fields and methods that an API action should have. API are one of two things: Queries or Mutations.
 * */
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
    QuokkaApiAction.prototype.asHook = function (apiInit) {
        var _a;
        if (!this.hasSetKey) {
            throw new Error("Should set key before attempting to generate mutation hook");
        }
        return _a = {},
            _a[this.generateHookName()] = this.generateHook(this.generateParams, apiInit),
            _a;
    };
    return QuokkaApiAction;
}());
exports.QuokkaApiAction = QuokkaApiAction;
