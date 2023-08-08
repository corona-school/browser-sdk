"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetFirstHidden = exports.trackFirstHidden = void 0;
var browser_core_1 = require("@datadog/browser-core");
var trackFirstHiddenSingleton;
var stopListeners;
function trackFirstHidden(eventTarget) {
    if (eventTarget === void 0) { eventTarget = window; }
    if (!trackFirstHiddenSingleton) {
        if (document.visibilityState === 'hidden') {
            trackFirstHiddenSingleton = {
                timeStamp: 0,
            };
        }
        else {
            trackFirstHiddenSingleton = {
                timeStamp: Infinity,
            };
            (stopListeners = (0, browser_core_1.addEventListeners)(eventTarget, ["pagehide" /* DOM_EVENT.PAGE_HIDE */, "visibilitychange" /* DOM_EVENT.VISIBILITY_CHANGE */], function (event) {
                if (event.type === 'pagehide' || document.visibilityState === 'hidden') {
                    trackFirstHiddenSingleton.timeStamp = event.timeStamp;
                    stopListeners();
                }
            }, { capture: true }).stop);
        }
    }
    return trackFirstHiddenSingleton;
}
exports.trackFirstHidden = trackFirstHidden;
function resetFirstHidden() {
    if (stopListeners) {
        stopListeners();
    }
    trackFirstHiddenSingleton = undefined;
}
exports.resetFirstHidden = resetFirstHidden;
//# sourceMappingURL=trackFirstHidden.js.map