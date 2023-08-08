"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackViewEventCounts = exports.KEEP_TRACKING_EVENT_COUNTS_AFTER_VIEW_DELAY = void 0;
var browser_core_1 = require("@datadog/browser-core");
var trackEventCounts_1 = require("../../trackEventCounts");
// Some events are not being counted as they transcend views. To reduce the occurrence;
// an arbitrary delay is added for stopping event counting after the view ends.
//
// Ideally, we would not stop and keep counting events until the end of the session.
// But this might have a small performance impact if there are many many views:
// we would need to go through each event to see if the related view matches.
// So let's have a fairly short delay to avoid impacting performances too much.
//
// In the future, we could have views stored in a data structure similar to ContextHistory. Whenever
// a child event is collected, we could look into this history to find the matching view and
// increase the associated and increase its counter. Having a centralized data structure for it
// would allow us to look for views more efficiently.
//
// For now, having a small cleanup delay will already improve the situation in most cases.
exports.KEEP_TRACKING_EVENT_COUNTS_AFTER_VIEW_DELAY = 5 * browser_core_1.ONE_MINUTE;
function trackViewEventCounts(lifeCycle, viewId, onChange) {
    var _a = (0, trackEventCounts_1.trackEventCounts)({
        lifeCycle: lifeCycle,
        isChildEvent: function (event) { return event.view.id === viewId; },
        onChange: onChange,
    }), stop = _a.stop, eventCounts = _a.eventCounts;
    return {
        scheduleStop: function () {
            (0, browser_core_1.setTimeout)(stop, exports.KEEP_TRACKING_EVENT_COUNTS_AFTER_VIEW_DELAY);
        },
        eventCounts: eventCounts,
    };
}
exports.trackViewEventCounts = trackViewEventCounts;
//# sourceMappingURL=trackViewEventCounts.js.map