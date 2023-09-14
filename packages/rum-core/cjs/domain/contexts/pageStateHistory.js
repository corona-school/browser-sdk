"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPageStateHistory = exports.PAGE_STATE_CONTEXT_TIME_OUT_DELAY = exports.MAX_PAGE_STATE_ENTRIES_SELECTABLE = exports.MAX_PAGE_STATE_ENTRIES = void 0;
var browser_core_1 = require("@datadog/browser-core");
// Arbitrary value to cap number of element for memory consumption in the browser
exports.MAX_PAGE_STATE_ENTRIES = 4000;
// Arbitrary value to cap number of element for backend & to save bandwidth
exports.MAX_PAGE_STATE_ENTRIES_SELECTABLE = 500;
exports.PAGE_STATE_CONTEXT_TIME_OUT_DELAY = browser_core_1.SESSION_TIME_OUT_DELAY;
function startPageStateHistory(configuration, maxPageStateEntriesSelectable) {
    if (maxPageStateEntriesSelectable === void 0) { maxPageStateEntriesSelectable = exports.MAX_PAGE_STATE_ENTRIES_SELECTABLE; }
    var pageStateHistory = new browser_core_1.ValueHistory(exports.PAGE_STATE_CONTEXT_TIME_OUT_DELAY, exports.MAX_PAGE_STATE_ENTRIES);
    var currentPageState;
    addPageState(getPageState(), (0, browser_core_1.relativeNow)());
    var stopEventListeners = (0, browser_core_1.addEventListeners)(configuration, window, [
        "pageshow" /* DOM_EVENT.PAGE_SHOW */,
        "focus" /* DOM_EVENT.FOCUS */,
        "blur" /* DOM_EVENT.BLUR */,
        "visibilitychange" /* DOM_EVENT.VISIBILITY_CHANGE */,
        "resume" /* DOM_EVENT.RESUME */,
        "freeze" /* DOM_EVENT.FREEZE */,
        "pagehide" /* DOM_EVENT.PAGE_HIDE */,
    ], function (event) {
        // Only get events fired by the browser to avoid false currentPageState changes done with custom events
        // cf: developer extension auto flush: https://github.com/DataDog/browser-sdk/blob/2f72bf05a672794c9e33965351964382a94c72ba/developer-extension/src/panel/flushEvents.ts#L11-L12
        if (event.isTrusted) {
            addPageState(computePageState(event), event.timeStamp);
        }
    }, { capture: true }).stop;
    function addPageState(nextPageState, startTime) {
        if (startTime === void 0) { startTime = (0, browser_core_1.relativeNow)(); }
        if (nextPageState === currentPageState) {
            return;
        }
        currentPageState = nextPageState;
        pageStateHistory.closeActive(startTime);
        pageStateHistory.add({ state: currentPageState, startTime: startTime }, startTime);
    }
    return {
        findAll: function (eventStartTime, duration) {
            var pageStateEntries = pageStateHistory.findAll(eventStartTime, duration);
            if (pageStateEntries.length === 0) {
                return;
            }
            var pageStateServerEntries = [];
            // limit the number of entries to return
            var limit = Math.max(0, pageStateEntries.length - maxPageStateEntriesSelectable);
            // loop page state entries backward to return the selected ones in desc order
            for (var index = pageStateEntries.length - 1; index >= limit; index--) {
                var pageState = pageStateEntries[index];
                // compute the start time relative to the event start time (ex: to be relative to the view start time)
                var relativeStartTime = (0, browser_core_1.elapsed)(eventStartTime, pageState.startTime);
                pageStateServerEntries.push({
                    state: pageState.state,
                    start: (0, browser_core_1.toServerDuration)(relativeStartTime),
                });
            }
            return pageStateServerEntries;
        },
        isInActivePageStateAt: function (startTime) {
            var pageStateEntry = pageStateHistory.find(startTime);
            return pageStateEntry !== undefined && pageStateEntry.state === "active" /* PageState.ACTIVE */;
        },
        addPageState: addPageState,
        stop: function () {
            stopEventListeners();
            pageStateHistory.stop();
        },
    };
}
exports.startPageStateHistory = startPageStateHistory;
function computePageState(event) {
    if (event.type === "freeze" /* DOM_EVENT.FREEZE */) {
        return "frozen" /* PageState.FROZEN */;
    }
    else if (event.type === "pagehide" /* DOM_EVENT.PAGE_HIDE */) {
        return event.persisted ? "frozen" /* PageState.FROZEN */ : "terminated" /* PageState.TERMINATED */;
    }
    return getPageState();
}
function getPageState() {
    if (document.visibilityState === 'hidden') {
        return "hidden" /* PageState.HIDDEN */;
    }
    if (document.hasFocus()) {
        return "active" /* PageState.ACTIVE */;
    }
    return "passive" /* PageState.PASSIVE */;
}
//# sourceMappingURL=pageStateHistory.js.map