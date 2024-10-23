"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuokkaContextProvider = void 0;
exports.useQuokkaContext = useQuokkaContext;
var react_1 = require("react");
var QuokkaContext = (0, react_1.createContext)({
    requests: {},
    inValidateRequest: function () { },
});
function useQuokkaContext() {
    return (0, react_1.useContext)(QuokkaContext);
}
exports.QuokkaContextProvider = QuokkaContext.Provider;
exports.default = QuokkaContext;
