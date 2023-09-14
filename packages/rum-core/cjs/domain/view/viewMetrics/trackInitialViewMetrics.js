"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackInitialViewMetrics = void 0;
var browser_core_1 = require("@datadog/browser-core");
var trackFirstContentfulPaint_1 = require("./trackFirstContentfulPaint");
var trackFirstInputTimings_1 = require("./trackFirstInputTimings");
var trackNavigationTimings_1 = require("./trackNavigationTimings");
var trackLargestContentfulPaint_1 = require("./trackLargestContentfulPaint");
var trackFirstHidden_1 = require("./trackFirstHidden");
function trackInitialViewMetrics(lifeCycle, configuration, webVitalTelemetryDebug, setLoadEvent, scheduleViewUpdate) {
    var initialViewMetrics = {};
    function setMetrics(newMetrics) {
        (0, browser_core_1.assign)(initialViewMetrics, newMetrics);
        scheduleViewUpdate();
    }
    var stopNavigationTracking = (0, trackNavigationTimings_1.trackNavigationTimings)(lifeCycle, function (navigationTimings) {
        setLoadEvent(navigationTimings.loadEvent);
        setMetrics(navigationTimings);
    }).stop;
    var firstHidden = (0, trackFirstHidden_1.trackFirstHidden)(configuration);
    var stopFCPTracking = (0, trackFirstContentfulPaint_1.trackFirstContentfulPaint)(lifeCycle, firstHidden, function (firstContentfulPaint) {
        return setMetrics({ firstContentfulPaint: firstContentfulPaint });
    }).stop;
    var stopLCPTracking = (0, trackLargestContentfulPaint_1.trackLargestContentfulPaint)(lifeCycle, configuration, firstHidden, window, function (largestContentfulPaint, lcpElement) {
        webVitalTelemetryDebug.addWebVitalTelemetryDebug('LCP', lcpElement, largestContentfulPaint);
        setMetrics({
            largestContentfulPaint: largestContentfulPaint,
        });
    }).stop;
    var stopFIDTracking = (0, trackFirstInputTimings_1.trackFirstInputTimings)(lifeCycle, firstHidden, function (_a) {
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
exports.trackInitialViewMetrics = trackInitialViewMetrics;
//# sourceMappingURL=trackInitialViewMetrics.js.map