"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initVisualViewportResizeObserver = exports.initViewportResizeObserver = void 0;
var browser_core_1 = require("@datadog/browser-core");
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var viewports_1 = require("../viewports");
var VISUAL_VIEWPORT_OBSERVER_THRESHOLD = 200;
function initViewportResizeObserver(configuration, cb) {
    return (0, browser_rum_core_1.initViewportObservable)(configuration).subscribe(cb).unsubscribe;
}
exports.initViewportResizeObserver = initViewportResizeObserver;
function initVisualViewportResizeObserver(configuration, cb) {
    var visualViewport = window.visualViewport;
    if (!visualViewport) {
        return browser_core_1.noop;
    }
    var _a = (0, browser_core_1.throttle)(function () {
        cb((0, viewports_1.getVisualViewport)(visualViewport));
    }, VISUAL_VIEWPORT_OBSERVER_THRESHOLD, {
        trailing: false,
    }), updateDimension = _a.throttled, cancelThrottle = _a.cancel;
    var removeListener = (0, browser_core_1.addEventListeners)(configuration, visualViewport, ["resize" /* DOM_EVENT.RESIZE */, "scroll" /* DOM_EVENT.SCROLL */], updateDimension, {
        capture: true,
        passive: true,
    }).stop;
    return function stop() {
        removeListener();
        cancelThrottle();
    };
}
exports.initVisualViewportResizeObserver = initVisualViewportResizeObserver;
//# sourceMappingURL=viewportResizeObserver.js.map