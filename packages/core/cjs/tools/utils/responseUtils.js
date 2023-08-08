"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryToClone = exports.isServerError = void 0;
function isServerError(status) {
    return status >= 500;
}
exports.isServerError = isServerError;
function tryToClone(response) {
    try {
        return response.clone();
    }
    catch (e) {
        // clone can throw if the response has already been used by another instrumentation or is disturbed
        return;
    }
}
exports.tryToClone = tryToClone;
//# sourceMappingURL=responseUtils.js.map