"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackCommonViewMetrics = void 0;
var browser_core_1 = require("@datadog/browser-core");
var trackScrollMetrics_1 = require("./trackScrollMetrics");
var trackLoadingTime_1 = require("./trackLoadingTime");
var trackCumulativeLayoutShift_1 = require("./trackCumulativeLayoutShift");
var trackInteractionToNextPaint_1 = require("./trackInteractionToNextPaint");
function trackCommonViewMetrics(lifeCycle, domMutationObservable, configuration, scheduleViewUpdate, loadingType, viewStart, webVitalTelemetryDebug) {
    var commonViewMetrics = {};
    var _a = (0, trackLoadingTime_1.trackLoadingTime)(lifeCycle, domMutationObservable, configuration, loadingType, viewStart, function (newLoadingTime) {
        commonViewMetrics.loadingTime = newLoadingTime;
        // We compute scroll metrics at loading time to ensure we have scroll data when loading the view initially
        // This is to ensure that we have the depth data even if the user didn't scroll or if the view is not scrollable.
        var _a = (0, trackScrollMetrics_1.computeScrollValues)(), scrollHeight = _a.scrollHeight, scrollDepth = _a.scrollDepth, scrollTop = _a.scrollTop;
        commonViewMetrics.scroll = {
            maxDepth: scrollDepth,
            maxDepthScrollHeight: scrollHeight,
            maxDepthTime: newLoadingTime,
            maxDepthScrollTop: scrollTop,
        };
        scheduleViewUpdate();
    }), stopLoadingTimeTracking = _a.stop, setLoadEvent = _a.setLoadEvent;
    var stopScrollMetricsTracking = (0, trackScrollMetrics_1.trackScrollMetrics)(configuration, viewStart, function (newScrollMetrics) {
        commonViewMetrics.scroll = newScrollMetrics;
    }, trackScrollMetrics_1.computeScrollValues).stop;
    var stopCLSTracking;
    var clsAttributionCollected = false;
    if ((0, trackCumulativeLayoutShift_1.isLayoutShiftSupported)()) {
        commonViewMetrics.cumulativeLayoutShift = 0;
        (stopCLSTracking = (0, trackCumulativeLayoutShift_1.trackCumulativeLayoutShift)(lifeCycle, function (cumulativeLayoutShift, largestLayoutShiftNode, largestLayoutShiftTime) {
            commonViewMetrics.cumulativeLayoutShift = cumulativeLayoutShift;
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
    var _b = (0, trackInteractionToNextPaint_1.trackInteractionToNextPaint)(loadingType, lifeCycle), stopINPTracking = _b.stop, getInteractionToNextPaint = _b.getInteractionToNextPaint;
    return {
        stop: function () {
            stopLoadingTimeTracking();
            stopCLSTracking();
            stopScrollMetricsTracking();
            stopINPTracking();
        },
        setLoadEvent: setLoadEvent,
        getCommonViewMetrics: function () {
            commonViewMetrics.interactionToNextPaint = getInteractionToNextPaint();
            return commonViewMetrics;
        },
    };
}
exports.trackCommonViewMetrics = trackCommonViewMetrics;
//# sourceMappingURL=trackCommonViewMetrics.js.map