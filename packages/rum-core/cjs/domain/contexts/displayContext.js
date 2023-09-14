"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startDisplayContext = void 0;
var viewportObservable_1 = require("../../browser/viewportObservable");
function startDisplayContext(configuration) {
    var viewport = (0, viewportObservable_1.getViewportDimension)();
    var unsubscribeViewport = (0, viewportObservable_1.initViewportObservable)(configuration).subscribe(function (viewportDimension) {
        viewport = viewportDimension;
    }).unsubscribe;
    return {
        get: function () { return ({ viewport: viewport }); },
        stop: unsubscribeViewport,
    };
}
exports.startDisplayContext = startDisplayContext;
//# sourceMappingURL=displayContext.js.map