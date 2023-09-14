"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackLargestContentfulPaint = exports.LCP_MAXIMUM_DELAY = void 0;
var browser_core_1 = require("@datadog/browser-core");
// Discard LCP timings above a certain delay to avoid incorrect data
// It happens in some cases like sleep mode or some browser implementations
exports.LCP_MAXIMUM_DELAY = 10 * browser_core_1.ONE_MINUTE;
/**
 * Track the largest contentful paint (LCP) occurring during the initial View.  This can yield
 * multiple values, only the most recent one should be used.
 * Documentation: https://web.dev/lcp/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/master/src/getLCP.ts
 */
function trackLargestContentfulPaint(lifeCycle, configuration, firstHidden, eventTarget, callback) {
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
                entry.startTime < exports.LCP_MAXIMUM_DELAY;
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
exports.trackLargestContentfulPaint = trackLargestContentfulPaint;
//# sourceMappingURL=trackLargestContentfulPaint.js.map