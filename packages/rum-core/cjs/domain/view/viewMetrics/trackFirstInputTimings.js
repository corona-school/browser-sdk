"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackFirstInputTimings = void 0;
var browser_core_1 = require("@datadog/browser-core");
/**
 * Track the first input occurring during the initial View to return:
 * - First Input Delay
 * - First Input Time
 * Callback is called at most one time.
 * Documentation: https://web.dev/fid/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/master/src/getFID.ts
 */
function trackFirstInputTimings(lifeCycle, firstHidden, callback) {
    var unsubscribeLifeCycle = lifeCycle.subscribe(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
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
        stop: unsubscribeLifeCycle,
    };
}
exports.trackFirstInputTimings = trackFirstInputTimings;
//# sourceMappingURL=trackFirstInputTimings.js.map