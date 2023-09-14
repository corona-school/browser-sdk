"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackFirstHidden = void 0;
var browser_core_1 = require("@datadog/browser-core");
function trackFirstHidden(configuration, eventTarget) {
    if (eventTarget === void 0) { eventTarget = window; }
    var timeStamp;
    var stopListeners;
    if (document.visibilityState === 'hidden') {
        timeStamp = 0;
    }
    else {
        timeStamp = Infinity;
        (stopListeners = (0, browser_core_1.addEventListeners)(configuration, eventTarget, ["pagehide" /* DOM_EVENT.PAGE_HIDE */, "visibilitychange" /* DOM_EVENT.VISIBILITY_CHANGE */], function (event) {
            if (event.type === "pagehide" /* DOM_EVENT.PAGE_HIDE */ || document.visibilityState === 'hidden') {
                timeStamp = event.timeStamp;
                stopListeners();
            }
        }, { capture: true }).stop);
    }
    return {
        get timeStamp() {
            return timeStamp;
        },
        stop: function () {
            stopListeners === null || stopListeners === void 0 ? void 0 : stopListeners();
        },
    };
}
exports.trackFirstHidden = trackFirstHidden;
//# sourceMappingURL=trackFirstHidden.js.map