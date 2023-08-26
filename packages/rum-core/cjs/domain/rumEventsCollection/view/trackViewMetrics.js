"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackScrollMetrics = exports.trackViewMetrics = exports.THROTTLE_SCROLL_DURATION = void 0;
var browser_core_1 = require("@datadog/browser-core");
var performanceCollection_1 = require("../../../browser/performanceCollection");
var waitPageActivityEnd_1 = require("../../waitPageActivityEnd");
var scroll_1 = require("../../../browser/scroll");
var viewportObservable_1 = require("../../../browser/viewportObservable");
/** Arbitrary scroll throttle duration */
exports.THROTTLE_SCROLL_DURATION = browser_core_1.ONE_SECOND;
function trackViewMetrics(lifeCycle, domMutationObservable, configuration, scheduleViewUpdate, loadingType, viewStart, webVitalTelemetryDebug) {
    var viewMetrics = {};
    var scrollMetrics;
    var _a = trackLoadingTime(lifeCycle, domMutationObservable, configuration, loadingType, viewStart, function (newLoadingTime) {
        viewMetrics.loadingTime = newLoadingTime;
        // We compute scroll metrics at loading time to ensure we have scroll data when loading the view initially
        // This is to ensure that we have the depth data even if the user didn't scroll or if the view is not scrollable.
        var _a = computeScrollValues(), scrollHeight = _a.scrollHeight, scrollDepth = _a.scrollDepth, scrollTop = _a.scrollTop;
        scrollMetrics = {
            maxDepth: scrollDepth,
            maxDepthScrollHeight: scrollHeight,
            maxDepthTime: newLoadingTime,
            maxDepthScrollTop: scrollTop,
        };
        scheduleViewUpdate();
    }), stopLoadingTimeTracking = _a.stop, setLoadEvent = _a.setLoadEvent;
    var stopScrollMetricsTracking = trackScrollMetrics(configuration, viewStart, function (newScrollMetrics) {
        scrollMetrics = newScrollMetrics;
    }, computeScrollValues).stop;
    var stopCLSTracking;
    var clsAttributionCollected = false;
    if (isLayoutShiftSupported()) {
        viewMetrics.cumulativeLayoutShift = 0;
        (stopCLSTracking = trackCumulativeLayoutShift(lifeCycle, function (cumulativeLayoutShift, largestLayoutShiftNode, largestLayoutShiftTime) {
            viewMetrics.cumulativeLayoutShift = cumulativeLayoutShift;
            if (!clsAttributionCollected) {
                clsAttributionCollected = true;
                webVitalTelemetryDebug.addWebVitalTelemetryDebug('CLS', largestLayoutShiftNode, largestLayoutShiftTime);
            }
            scheduleViewUpdate();
        }).stop);
    }
    else {
        stopCLSTracking = browser_core_1.noop;
    }
    return {
        stop: function () {
            stopLoadingTimeTracking();
            stopCLSTracking();
            stopScrollMetricsTracking();
        },
        setLoadEvent: setLoadEvent,
        viewMetrics: viewMetrics,
        getScrollMetrics: function () { return scrollMetrics; },
    };
}
exports.trackViewMetrics = trackViewMetrics;
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
function trackLoadingTime(lifeCycle, domMutationObservable, configuration, loadType, viewStart, callback) {
    var isWaitingForLoadEvent = loadType === "initial_load" /* ViewLoadingType.INITIAL_LOAD */;
    var isWaitingForActivityLoadingTime = true;
    var loadingTimeCandidates = [];
    function invokeCallbackIfAllCandidatesAreReceived() {
        if (!isWaitingForActivityLoadingTime && !isWaitingForLoadEvent && loadingTimeCandidates.length > 0) {
            callback(Math.max.apply(Math, loadingTimeCandidates));
        }
    }
    var stop = (0, waitPageActivityEnd_1.waitPageActivityEnd)(lifeCycle, domMutationObservable, configuration, function (event) {
        if (isWaitingForActivityLoadingTime) {
            isWaitingForActivityLoadingTime = false;
            if (event.hadActivity) {
                loadingTimeCandidates.push((0, browser_core_1.elapsed)(viewStart.timeStamp, event.end));
            }
            invokeCallbackIfAllCandidatesAreReceived();
        }
    }).stop;
    return {
        stop: stop,
        setLoadEvent: function (loadEvent) {
            if (isWaitingForLoadEvent) {
                isWaitingForLoadEvent = false;
                loadingTimeCandidates.push(loadEvent);
                invokeCallbackIfAllCandidatesAreReceived();
            }
        },
    };
}
/**
 * Track the cumulative layout shifts (CLS).
 * Layout shifts are grouped into session windows.
 * The minimum gap between session windows is 1 second.
 * The maximum duration of a session window is 5 second.
 * The session window layout shift value is the sum of layout shifts inside it.
 * The CLS value is the max of session windows values.
 *
 * This yields a new value whenever the CLS value is updated (a higher session window value is computed).
 *
 * See isLayoutShiftSupported to check for browser support.
 *
 * Documentation:
 * https://web.dev/cls/
 * https://web.dev/evolving-cls/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/master/src/getCLS.ts
 */
function trackCumulativeLayoutShift(lifeCycle, callback) {
    var maxClsValue = 0;
    var window = slidingSessionWindow();
    var stop = lifeCycle.subscribe(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                window.update(entry);
                if (window.value() > maxClsValue) {
                    maxClsValue = window.value();
                    callback((0, browser_core_1.round)(maxClsValue, 4), window.largestLayoutShiftNode(), window.largestLayoutShiftTime());
                }
            }
        }
    }).unsubscribe;
    return {
        stop: stop,
    };
}
function slidingSessionWindow() {
    var value = 0;
    var startTime;
    var endTime;
    var largestLayoutShift = 0;
    var largestLayoutShiftNode;
    var largestLayoutShiftTime;
    return {
        update: function (entry) {
            var _a;
            var shouldCreateNewWindow = startTime === undefined ||
                entry.startTime - endTime >= browser_core_1.ONE_SECOND ||
                entry.startTime - startTime >= 5 * browser_core_1.ONE_SECOND;
            if (shouldCreateNewWindow) {
                startTime = endTime = entry.startTime;
                value = entry.value;
                largestLayoutShift = 0;
                largestLayoutShiftNode = undefined;
            }
            else {
                value += entry.value;
                endTime = entry.startTime;
            }
            if (entry.value > largestLayoutShift) {
                largestLayoutShift = entry.value;
                largestLayoutShiftTime = entry.startTime;
                if ((_a = entry.sources) === null || _a === void 0 ? void 0 : _a.length) {
                    var largestLayoutShiftSource = (0, browser_core_1.find)(entry.sources, function (s) { var _a; return ((_a = s.node) === null || _a === void 0 ? void 0 : _a.nodeType) === 1; }) || entry.sources[0];
                    largestLayoutShiftNode = largestLayoutShiftSource.node;
                }
                else {
                    largestLayoutShiftNode = undefined;
                }
            }
        },
        value: function () { return value; },
        largestLayoutShiftNode: function () { return largestLayoutShiftNode; },
        largestLayoutShiftTime: function () { return largestLayoutShiftTime; },
    };
}
/**
 * Check whether `layout-shift` is supported by the browser.
 */
function isLayoutShiftSupported() {
    return (0, performanceCollection_1.supportPerformanceTimingEvent)('layout-shift');
}
//# sourceMappingURL=trackViewMetrics.js.map