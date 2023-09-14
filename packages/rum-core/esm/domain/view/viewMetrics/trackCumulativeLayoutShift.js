import { round, find, ONE_SECOND } from '@datadog/browser-core';
import { supportPerformanceTimingEvent } from '../../../browser/performanceCollection';
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
export function trackCumulativeLayoutShift(lifeCycle, callback) {
    var maxClsValue = 0;
    var window = slidingSessionWindow();
    var stop = lifeCycle.subscribe(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                window.update(entry);
                if (window.value() > maxClsValue) {
                    maxClsValue = window.value();
                    callback(round(maxClsValue, 4), window.largestLayoutShiftNode(), window.largestLayoutShiftTime());
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
                entry.startTime - endTime >= ONE_SECOND ||
                entry.startTime - startTime >= 5 * ONE_SECOND;
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
                    var largestLayoutShiftSource = find(entry.sources, function (s) { var _a; return ((_a = s.node) === null || _a === void 0 ? void 0 : _a.nodeType) === 1; }) || entry.sources[0];
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
export function isLayoutShiftSupported() {
    return supportPerformanceTimingEvent('layout-shift');
}
//# sourceMappingURL=trackCumulativeLayoutShift.js.map