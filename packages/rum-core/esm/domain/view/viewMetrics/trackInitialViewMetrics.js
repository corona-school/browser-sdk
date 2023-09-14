import { assign } from '@datadog/browser-core';
import { trackFirstContentfulPaint } from './trackFirstContentfulPaint';
import { trackFirstInputTimings } from './trackFirstInputTimings';
import { trackNavigationTimings } from './trackNavigationTimings';
import { trackLargestContentfulPaint } from './trackLargestContentfulPaint';
import { trackFirstHidden } from './trackFirstHidden';
export function trackInitialViewMetrics(lifeCycle, configuration, webVitalTelemetryDebug, setLoadEvent, scheduleViewUpdate) {
    var initialViewMetrics = {};
    function setMetrics(newMetrics) {
        assign(initialViewMetrics, newMetrics);
        scheduleViewUpdate();
    }
    var stopNavigationTracking = trackNavigationTimings(lifeCycle, function (navigationTimings) {
        setLoadEvent(navigationTimings.loadEvent);
        setMetrics(navigationTimings);
    }).stop;
    var firstHidden = trackFirstHidden(configuration);
    var stopFCPTracking = trackFirstContentfulPaint(lifeCycle, firstHidden, function (firstContentfulPaint) {
        return setMetrics({ firstContentfulPaint: firstContentfulPaint });
    }).stop;
    var stopLCPTracking = trackLargestContentfulPaint(lifeCycle, configuration, firstHidden, window, function (largestContentfulPaint, lcpElement) {
        webVitalTelemetryDebug.addWebVitalTelemetryDebug('LCP', lcpElement, largestContentfulPaint);
        setMetrics({
            largestContentfulPaint: largestContentfulPaint,
        });
    }).stop;
    var stopFIDTracking = trackFirstInputTimings(lifeCycle, firstHidden, function (_a) {
        var firstInputDelay = _a.firstInputDelay, firstInputTime = _a.firstInputTime, firstInputTarget = _a.firstInputTarget;
        webVitalTelemetryDebug.addWebVitalTelemetryDebug('FID', firstInputTarget, firstInputTime);
        setMetrics({
            firstInputDelay: firstInputDelay,
            firstInputTime: firstInputTime,
        });
    }).stop;
    function stop() {
        stopNavigationTracking();
        stopFCPTracking();
        stopLCPTracking();
        stopFIDTracking();
        firstHidden.stop();
    }
    return {
        stop: stop,
        initialViewMetrics: initialViewMetrics,
    };
}
//# sourceMappingURL=trackInitialViewMetrics.js.map