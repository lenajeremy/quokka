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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useQuokkaContext = useQuokkaContext;
exports.QuokkaContextProvider = QuokkaContextProvider;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = __importDefault(require("react"));
var GeneralQuokkaContext = react_1.default.createContext({
    apis: {},
    setApi: function () {
    },
});
function useQuokkaContext() {
    var _a = react_1.default.useContext(GeneralQuokkaContext), apis = _a.apis, setApi = _a.setApi;
    var apisRef = react_1.default.useRef(apis);
    react_1.default.useEffect(function () {
        apisRef.current = apis;
    }, [apis]);
    return {
        update: function (apiName, hookName, id, value) {
            var apis = apisRef.current;
            var api = apis[apiName];
            if (!api) {
                api = {
                    queries: {},
                    mutations: {},
                };
            }
            // get the key --- key or mutation
            var key = hookName.endsWith("Mutation") ? "mutations" : "queries";
            // get the query or mutation
            var queryOrMutation = api[key];
            if (!queryOrMutation[hookName]) {
                queryOrMutation[hookName] = {};
            }
            queryOrMutation[hookName][id] = value;
            setApi(function (apis) {
                var _a;
                return (__assign(__assign({}, apis), (_a = {}, _a[apiName] = api, _a)));
            });
        },
        get: function (apiName, hookName, id) {
            var apis = apisRef.current;
            var key = hookName.endsWith("Mutation") ? "mutations" : "queries";
            if (apis[apiName] &&
                apis[apiName][key][hookName] &&
                apis[apiName][key][hookName][id]) {
                return apis[apiName][key][hookName][id];
            }
        },
    };
}
function QuokkaContextProvider(_a) {
    var children = _a.children;
    var _b = react_1.default.useState({}), apis = _b[0], setApi = _b[1];
    return ((0, jsx_runtime_1.jsx)(GeneralQuokkaContext.Provider, { value: { apis: apis, setApi: setApi }, children: children }));
}
