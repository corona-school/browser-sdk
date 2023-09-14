"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeScrollValues = exports.trackScrollMetrics = exports.THROTTLE_SCROLL_DURATION = void 0;
var browser_core_1 = require("@datadog/browser-core");
var scroll_1 = require("../../../browser/scroll");
var viewportObservable_1 = require("../../../browser/viewportObservable");
/** Arbitrary scroll throttle duration */
exports.THROTTLE_SCROLL_DURATION = browser_core_1.ONE_SECOND;
function trackScrollMetrics(configuration, viewStart, callback, getScrollValues) {
    if (getScrollValues === void 0) { getScrollValues = computeScrollValues; }
    var maxDepth = 0;
    var handleScrollEvent = (0, browser_core_1.throttle)(function () {
        var _a = getScrollValues(), scrollHeight = _a.scrollHeight, scrollDepth = _a.scrollDepth, scrollTop = _a.scrollTop;
        if (scrollDepth > maxDepth) {
            var now = (0, browser_core_1.relativeNow)();
            var maxDepthTime = (0, browser_core_1.elapsed)(viewStart.relative, now);
            maxDepth = scrollDepth;
            callback({
                maxDepth: maxDepth,
                maxDepthScrollHeight: scrollHeight,
                maxDepthTime: maxDepthTime,
                maxDepthScrollTop: scrollTop,
            });
        }
    }, exports.THROTTLE_SCROLL_DURATION, { leading: false, trailing: true });
    var stop = (0, browser_core_1.addEventListener)(configuration, window, "scroll" /* DOM_EVENT.SCROLL */, handleScrollEvent.throttled, {
        passive: true,
    }).stop;
    return {
        stop: function () {
            handleScrollEvent.cancel();
            stop();
        },
    };
}
exports.trackScrollMetrics = trackScrollMetrics;
function computeScrollValues() {
    var scrollTop = (0, scroll_1.getScrollY)();
    var height = (0, viewportObservable_1.getViewportDimension)().height;
    var scrollHeight = Math.round((document.scrollingElement || document.documentElement).scrollHeight);
    var scrollDepth = Math.round(height + scrollTop);
    return {
        scrollHeight: scrollHeight,
        scrollDepth: scrollDepth,
        scrollTop: scrollTop,
    };
}
exports.computeScrollValues = computeScrollValues;
//# sourceMappingURL=trackScrollMetrics.js.map