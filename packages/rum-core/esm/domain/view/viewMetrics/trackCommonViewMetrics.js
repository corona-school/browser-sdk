import { noop } from '@datadog/browser-core';
import { computeScrollValues, trackScrollMetrics } from './trackScrollMetrics';
import { trackLoadingTime } from './trackLoadingTime';
import { isLayoutShiftSupported, trackCumulativeLayoutShift } from './trackCumulativeLayoutShift';
import { trackInteractionToNextPaint } from './trackInteractionToNextPaint';
export function trackCommonViewMetrics(lifeCycle, domMutationObservable, configuration, scheduleViewUpdate, loadingType, viewStart, webVitalTelemetryDebug) {
    var commonViewMetrics = {};
    var _a = trackLoadingTime(lifeCycle, domMutationObservable, configuration, loadingType, viewStart, function (newLoadingTime) {
        commonViewMetrics.loadingTime = newLoadingTime;
        // We compute scroll metrics at loading time to ensure we have scroll data when loading the view initially
        // This is to ensure that we have the depth data even if the user didn't scroll or if the view is not scrollable.
        var _a = computeScrollValues(), scrollHeight = _a.scrollHeight, scrollDepth = _a.scrollDepth, scrollTop = _a.scrollTop;
        commonViewMetrics.scroll = {
            maxDepth: scrollDepth,
            maxDepthScrollHeight: scrollHeight,
            maxDepthTime: newLoadingTime,
            maxDepthScrollTop: scrollTop,
        };
        scheduleViewUpdate();
    }), stopLoadingTimeTracking = _a.stop, setLoadEvent = _a.setLoadEvent;
    var stopScrollMetricsTracking = trackScrollMetrics(configuration, viewStart, function (newScrollMetrics) {
        commonViewMetrics.scroll = newScrollMetrics;
    }, computeScrollValues).stop;
    var stopCLSTracking;
    var clsAttributionCollected = false;
    if (isLayoutShiftSupported()) {
        commonViewMetrics.cumulativeLayoutShift = 0;
        (stopCLSTracking = trackCumulativeLayoutShift(lifeCycle, function (cumulativeLayoutShift, largestLayoutShiftNode, largestLayoutShiftTime) {
            commonViewMetrics.cumulativeLayoutShift = cumulativeLayoutShift;
            if (!clsAttributionCollected) {
                clsAttributionCollected = true;
                webVitalTelemetryDebug.addWebVitalTelemetryDebug('CLS', largestLayoutShiftNode, largestLayoutShiftTime);
            }
            scheduleViewUpdate();
        }).stop);
    }
    else {
        stopCLSTracking = noop;
    }
    var _b = trackInteractionToNextPaint(loadingType, lifeCycle), stopINPTracking = _b.stop, getInteractionToNextPaint = _b.getInteractionToNextPaint;
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
//# sourceMappingURL=trackCommonViewMetrics.js.map