"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getViewportDimension = exports.createViewportObservable = exports.initViewportObservable = void 0;
var browser_core_1 = require("@datadog/browser-core");
var viewportObservable;
function initViewportObservable(configuration) {
    if (!viewportObservable) {
        viewportObservable = createViewportObservable(configuration);
    }
    return viewportObservable;
}
exports.initViewportObservable = initViewportObservable;
function createViewportObservable(configuration) {
    var observable = new browser_core_1.Observable(function () {
        var updateDimension = (0, browser_core_1.throttle)(function () {
            observable.notify(getViewportDimension());
        }, 200).throttled;
        return (0, browser_core_1.addEventListener)(configuration, window, "resize" /* DOM_EVENT.RESIZE */, updateDimension, { capture: true, passive: true })
            .stop;
    });
    return observable;
}
exports.createViewportObservable = createViewportObservable;
// excludes the width and height of any rendered classic scrollbar that is fixed to the visual viewport
function getViewportDimension() {
    var visual = window.visualViewport;
    if (visual) {
        return {
            width: Number(visual.width * visual.scale),
            height: Number(visual.height * visual.scale),
        };
    }
    return {
        width: Number(window.innerWidth || 0),
        height: Number(window.innerHeight || 0),
    };
}
exports.getViewportDimension = getViewportDimension;
//# sourceMappingURL=viewportObservable.js.map