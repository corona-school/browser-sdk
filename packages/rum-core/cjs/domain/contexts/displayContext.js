"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetDisplayContext = exports.getDisplayContext = void 0;
var viewportObservable_1 = require("../../browser/viewportObservable");
var viewport;
var stopListeners;
function getDisplayContext(configuration) {
    if (!viewport) {
        viewport = (0, viewportObservable_1.getViewportDimension)();
        stopListeners = (0, viewportObservable_1.initViewportObservable)(configuration).subscribe(function (viewportDimension) {
            viewport = viewportDimension;
        }).unsubscribe;
    }
    return {
        viewport: viewport,
    };
}
exports.getDisplayContext = getDisplayContext;
function resetDisplayContext() {
    if (stopListeners) {
        stopListeners();
    }
    viewport = undefined;
}
exports.resetDisplayContext = resetDisplayContext;
//# sourceMappingURL=displayContext.js.map