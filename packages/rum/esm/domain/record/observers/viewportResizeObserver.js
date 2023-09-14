import { throttle, addEventListeners, noop } from '@datadog/browser-core';
import { initViewportObservable } from '@datadog/browser-rum-core';
import { getVisualViewport } from '../viewports';
var VISUAL_VIEWPORT_OBSERVER_THRESHOLD = 200;
export function initViewportResizeObserver(configuration, cb) {
    return initViewportObservable(configuration).subscribe(cb).unsubscribe;
}
export function initVisualViewportResizeObserver(configuration, cb) {
    var visualViewport = window.visualViewport;
    if (!visualViewport) {
        return noop;
    }
    var _a = throttle(function () {
        cb(getVisualViewport(visualViewport));
    }, VISUAL_VIEWPORT_OBSERVER_THRESHOLD, {
        trailing: false,
    }), updateDimension = _a.throttled, cancelThrottle = _a.cancel;
    var removeListener = addEventListeners(configuration, visualViewport, ["resize" /* DOM_EVENT.RESIZE */, "scroll" /* DOM_EVENT.SCROLL */], updateDimension, {
        capture: true,
        passive: true,
    }).stop;
    return function stop() {
        removeListener();
        cancelThrottle();
    };
}
//# sourceMappingURL=viewportResizeObserver.js.map