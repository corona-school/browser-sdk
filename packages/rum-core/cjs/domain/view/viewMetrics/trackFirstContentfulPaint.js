"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackFirstContentfulPaint = exports.FCP_MAXIMUM_DELAY = void 0;
var browser_core_1 = require("@datadog/browser-core");
// Discard FCP timings above a certain delay to avoid incorrect data
// It happens in some cases like sleep mode or some browser implementations
exports.FCP_MAXIMUM_DELAY = 10 * browser_core_1.ONE_MINUTE;
function trackFirstContentfulPaint(lifeCycle, firstHidden, callback) {
    var unsubscribeLifeCycle = lifeCycle.subscribe(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        var fcpEntry = (0, browser_core_1.find)(entries, function (entry) {
            return entry.entryType === 'paint' &&
                entry.name === 'first-contentful-paint' &&
                entry.startTime < firstHidden.timeStamp &&
                entry.startTime < exports.FCP_MAXIMUM_DELAY;
        });
        if (fcpEntry) {
            callback(fcpEntry.startTime);
        }
    }).unsubscribe;
    return {
        stop: unsubscribeLifeCycle,
    };
}
exports.trackFirstContentfulPaint = trackFirstContentfulPaint;
//# sourceMappingURL=trackFirstContentfulPaint.js.map