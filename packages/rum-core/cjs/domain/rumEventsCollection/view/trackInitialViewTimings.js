"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackFirstInputTimings = exports.trackLargestContentfulPaintTiming = exports.trackFirstContentfulPaintTiming = exports.trackNavigationTimings = exports.trackInitialViewTimings = exports.KEEP_TRACKING_TIMINGS_AFTER_VIEW_DELAY = exports.TIMING_MAXIMUM_DELAY = void 0;
var browser_core_1 = require("@datadog/browser-core");
var trackFirstHidden_1 = require("./trackFirstHidden");
// Discard LCP and FCP timings above a certain delay to avoid incorrect data
// It happens in some cases like sleep mode or some browser implementations
exports.TIMING_MAXIMUM_DELAY = 10 * browser_core_1.ONE_MINUTE;
/**
 * The initial view can finish quickly, before some metrics can be produced (ex: before the page load
 * event, or the first input). Also, we don't want to trigger a view update indefinitely, to avoid
 * updates on views that ended a long time ago. Keep watching for metrics after the view ends for a
 * limited amount of time.
 */
exports.KEEP_TRACKING_TIMINGS_AFTER_VIEW_DELAY = 5 * browser_core_1.ONE_MINUTE;
function trackInitialViewTimings(lifeCycle, configuration, webVitalTelemetryDebug, setLoadEvent, scheduleViewUpdate) {
    var timings = {};
    function setTimings(newTimings) {
        (0, browser_core_1.assign)(timings, newTimings);
        scheduleViewUpdate();
    }
    var stopNavigationTracking = trackNavigationTimings(lifeCycle, function (newTimings) {
        setLoadEvent(newTimings.loadEvent);
        setTimings(newTimings);
    }).stop;
    var stopFCPTracking = trackFirstContentfulPaintTiming(lifeCycle, configuration, function (firstContentfulPaint) {
        return setTimings({ firstContentfulPaint: firstContentfulPaint });
    }).stop;
    var stopLCPTracking = trackLargestContentfulPaintTiming(lifeCycle, configuration, window, function (largestContentfulPaint, lcpElement) {
        webVitalTelemetryDebug.addWebVitalTelemetryDebug('LCP', lcpElement, largestContentfulPaint);
        setTimings({
            largestContentfulPaint: largestContentfulPaint,
        });
    }).stop;
    var stopFIDTracking = trackFirstInputTimings(lifeCycle, configuration, function (_a) {
        var firstInputDelay = _a.firstInputDelay, firstInputTime = _a.firstInputTime, firstInputTarget = _a.firstInputTarget;
        webVitalTelemetryDebug.addWebVitalTelemetryDebug('FID', firstInputTarget, firstInputTime);
        setTimings({
            firstInputDelay: firstInputDelay,
            firstInputTime: firstInputTime,
        });
    }).stop;
    function stop() {
        stopNavigationTracking();
        stopFCPTracking();
        stopLCPTracking();
        stopFIDTracking();
    }
    return {
        stop: stop,
        timings: timings,
        scheduleStop: function () {
            (0, browser_core_1.setTimeout)(stop, exports.KEEP_TRACKING_TIMINGS_AFTER_VIEW_DELAY);
        },
    };
}
exports.trackInitialViewTimings = trackInitialViewTimings;
function trackNavigationTimings(lifeCycle, callback) {
    var stop = lifeCycle.subscribe(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            if (entry.entryType === 'navigation') {
                callback({
                    domComplete: entry.domComplete,
                    domContentLoaded: entry.domContentLoadedEventEnd,
                    domInteractive: entry.domInteractive,
                    loadEvent: entry.loadEventEnd,
                    // In some cases the value reported is negative or is larger
                    // than the current page time. Ignore these cases:
                    // https://github.com/GoogleChrome/web-vitals/issues/137
                    // https://github.com/GoogleChrome/web-vitals/issues/162
                    firstByte: entry.responseStart >= 0 && entry.responseStart <= (0, browser_core_1.relativeNow)() ? entry.responseStart : undefined,
                });
            }
        }
    }).unsubscribe;
    return { stop: stop };
}
exports.trackNavigationTimings = trackNavigationTimings;
function trackFirstContentfulPaintTiming(lifeCycle, configuration, callback) {
    var firstHidden = (0, trackFirstHidden_1.trackFirstHidden)(configuration);
    var stop = lifeCycle.subscribe(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        var fcpEntry = (0, browser_core_1.find)(entries, function (entry) {
            return entry.entryType === 'paint' &&
                entry.name === 'first-contentful-paint' &&
                entry.startTime < firstHidden.timeStamp &&
                entry.startTime < exports.TIMING_MAXIMUM_DELAY;
        });
        if (fcpEntry) {
            callback(fcpEntry.startTime);
        }
    }).unsubscribe;
    return { stop: stop };
}
exports.trackFirstContentfulPaintTiming = trackFirstContentfulPaintTiming;
/**
 * Track the largest contentful paint (LCP) occurring during the initial View.  This can yield
 * multiple values, only the most recent one should be used.
 * Documentation: https://web.dev/lcp/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/master/src/getLCP.ts
 */
function trackLargestContentfulPaintTiming(lifeCycle, configuration, eventTarget, callback) {
    var firstHidden = (0, trackFirstHidden_1.trackFirstHidden)(configuration);
    // Ignore entries that come after the first user interaction.  According to the documentation, the
    // browser should not send largest-contentful-paint entries after a user interact with the page,
    // but the web-vitals reference implementation uses this as a safeguard.
    var firstInteractionTimestamp = Infinity;
    var stopEventListener = (0, browser_core_1.addEventListeners)(configuration, eventTarget, ["pointerdown" /* DOM_EVENT.POINTER_DOWN */, "keydown" /* DOM_EVENT.KEY_DOWN */], function (event) {
        firstInteractionTimestamp = event.timeStamp;
    }, { capture: true, once: true }).stop;
    var unsubscribeLifeCycle = lifeCycle.subscribe(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        var lcpEntry = (0, browser_core_1.findLast)(entries, function (entry) {
            return entry.entryType === 'largest-contentful-paint' &&
                entry.startTime < firstInteractionTimestamp &&
                entry.startTime < firstHidden.timeStamp &&
                entry.startTime < exports.TIMING_MAXIMUM_DELAY;
        });
        if (lcpEntry) {
            callback(lcpEntry.startTime, lcpEntry.element);
        }
    }).unsubscribe;
    return {
        stop: function () {
            stopEventListener();
            unsubscribeLifeCycle();
        },
    };
}
exports.trackLargestContentfulPaintTiming = trackLargestContentfulPaintTiming;
/**
 * Track the first input occurring during the initial View to return:
 * - First Input Delay
 * - First Input Time
 * Callback is called at most one time.
 * Documentation: https://web.dev/fid/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/master/src/getFID.ts
 */
function trackFirstInputTimings(lifeCycle, configuration, callback) {
    var firstHidden = (0, trackFirstHidden_1.trackFirstHidden)(configuration);
    var stop = lifeCycle.subscribe(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        var firstInputEntry = (0, browser_core_1.find)(entries, function (entry) {
            return entry.entryType === 'first-input' && entry.startTime < firstHidden.timeStamp;
        });
        if (firstInputEntry) {
            var firstInputDelay = (0, browser_core_1.elapsed)(firstInputEntry.startTime, firstInputEntry.processingStart);
            callback({
                // Ensure firstInputDelay to be positive, see
                // https://bugs.chromium.org/p/chromium/issues/detail?id=1185815
                firstInputDelay: firstInputDelay >= 0 ? firstInputDelay : 0,
                firstInputTime: firstInputEntry.startTime,
                firstInputTarget: firstInputEntry.target,
            });
        }
    }).unsubscribe;
    return {
        stop: stop,
    };
}
exports.trackFirstInputTimings = trackFirstInputTimings;
//# sourceMappingURL=trackInitialViewTimings.js.map