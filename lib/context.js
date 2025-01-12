"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useQuokkaContext = useQuokkaContext;
exports.QuokkaProvider = QuokkaProvider;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = __importDefault(require("react"));
var cache_1 = require("./cache");
var GeneralQuokkaContext = react_1.default.createContext({});
function useQuokkaContext() {
    return react_1.default.useContext(GeneralQuokkaContext);
}
function QuokkaProvider(_a) {
    var children = _a.children, getState = _a.getState;
    var cacheManager = new cache_1.CacheManager();
    return ((0, jsx_runtime_1.jsx)(GeneralQuokkaContext.Provider, { value: { cacheManager: cacheManager, getState: getState }, children: children }));
}
