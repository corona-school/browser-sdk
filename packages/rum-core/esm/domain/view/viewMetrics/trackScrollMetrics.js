import { ONE_SECOND, elapsed, relativeNow, throttle, addEventListener } from '@datadog/browser-core';
import { getScrollY } from '../../../browser/scroll';
import { getViewportDimension } from '../../../browser/viewportObservable';
/** Arbitrary scroll throttle duration */
export var THROTTLE_SCROLL_DURATION = ONE_SECOND;
export function trackScrollMetrics(configuration, viewStart, callback, getScrollValues) {
    if (getScrollValues === void 0) { getScrollValues = computeScrollValues; }
    var maxDepth = 0;
    var handleScrollEvent = throttle(function () {
        var _a = getScrollValues(), scrollHeight = _a.scrollHeight, scrollDepth = _a.scrollDepth, scrollTop = _a.scrollTop;
        if (scrollDepth > maxDepth) {
            var now = relativeNow();
            var maxDepthTime = elapsed(viewStart.relative, now);
            maxDepth = scrollDepth;
            callback({
                maxDepth: maxDepth,
                maxDepthScrollHeight: scrollHeight,
                maxDepthTime: maxDepthTime,
                maxDepthScrollTop: scrollTop,
            });
        }
    }, THROTTLE_SCROLL_DURATION, { leading: false, trailing: true });
    var stop = addEventListener(configuration, window, "scroll" /* DOM_EVENT.SCROLL */, handleScrollEvent.throttled, {
        passive: true,
    }).stop;
    return {
        stop: function () {
            handleScrollEvent.cancel();
            stop();
        },
    };
}
export function computeScrollValues() {
    var scrollTop = getScrollY();
    var height = getViewportDimension().height;
    var scrollHeight = Math.round((document.scrollingElement || document.documentElement).scrollHeight);
    var scrollDepth = Math.round(height + scrollTop);
    return {
        scrollHeight: scrollHeight,
        scrollDepth: scrollDepth,
        scrollTop: scrollTop,
    };
}
//# sourceMappingURL=trackScrollMetrics.js.map