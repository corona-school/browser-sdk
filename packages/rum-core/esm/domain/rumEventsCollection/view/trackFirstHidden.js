import { addEventListeners } from '@datadog/browser-core';
var trackFirstHiddenSingleton;
var stopListeners;
export function trackFirstHidden(eventTarget) {
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
            (stopListeners = addEventListeners(eventTarget, ["pagehide" /* DOM_EVENT.PAGE_HIDE */, "visibilitychange" /* DOM_EVENT.VISIBILITY_CHANGE */], function (event) {
                if (event.type === 'pagehide' || document.visibilityState === 'hidden') {
                    trackFirstHiddenSingleton.timeStamp = event.timeStamp;
                    stopListeners();
                }
            }, { capture: true }).stop);
        }
    }
    return trackFirstHiddenSingleton;
}
export function resetFirstHidden() {
    if (stopListeners) {
        stopListeners();
    }
    trackFirstHiddenSingleton = undefined;
}
//# sourceMappingURL=trackFirstHidden.js.map