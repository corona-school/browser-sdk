import { ValueHistory } from '../../tools/valueHistory';
import { relativeNow, clocksOrigin, ONE_MINUTE } from '../../tools/utils/timeUtils';
import { addEventListener, addEventListeners } from '../../browser/addEventListener';
import { clearInterval, setInterval } from '../../tools/timer';
import { SESSION_TIME_OUT_DELAY } from './sessionConstants';
import { startSessionStore } from './sessionStore';
export var VISIBILITY_CHECK_DELAY = ONE_MINUTE;
var SESSION_CONTEXT_TIMEOUT_DELAY = SESSION_TIME_OUT_DELAY;
var stopCallbacks = [];
export function startSessionManager(configuration, productKey, computeSessionState) {
    // TODO - Improve configuration type and remove assertion
    var sessionStore = startSessionStore(configuration.sessionStoreStrategyType, productKey, computeSessionState);
    stopCallbacks.push(function () { return sessionStore.stop(); });
    var sessionContextHistory = new ValueHistory(SESSION_CONTEXT_TIMEOUT_DELAY);
    stopCallbacks.push(function () { return sessionContextHistory.stop(); });
    sessionStore.renewObservable.subscribe(function () {
        sessionContextHistory.add(buildSessionContext(), relativeNow());
    });
    sessionStore.expireObservable.subscribe(function () {
        sessionContextHistory.closeActive(relativeNow());
    });
    sessionStore.expandOrRenewSession();
    sessionContextHistory.add(buildSessionContext(), clocksOrigin().relative);
    trackActivity(configuration, function () { return sessionStore.expandOrRenewSession(); });
    trackVisibility(configuration, function () { return sessionStore.expandSession(); });
    function buildSessionContext() {
        return {
            id: sessionStore.getSession().id,
            trackingType: sessionStore.getSession()[productKey],
        };
    }
    return {
        findActiveSession: function (startTime) { return sessionContextHistory.find(startTime); },
        renewObservable: sessionStore.renewObservable,
        expireObservable: sessionStore.expireObservable,
        expire: sessionStore.expire,
    };
}
export function stopSessionManager() {
    stopCallbacks.forEach(function (e) { return e(); });
    stopCallbacks = [];
}
function trackActivity(configuration, expandOrRenewSession) {
    var stop = addEventListeners(configuration, window, ["click" /* DOM_EVENT.CLICK */, "touchstart" /* DOM_EVENT.TOUCH_START */, "keydown" /* DOM_EVENT.KEY_DOWN */, "scroll" /* DOM_EVENT.SCROLL */], expandOrRenewSession, { capture: true, passive: true }).stop;
    stopCallbacks.push(stop);
}
function trackVisibility(configuration, expandSession) {
    var expandSessionWhenVisible = function () {
        if (document.visibilityState === 'visible') {
            expandSession();
        }
    };
    var stop = addEventListener(configuration, document, "visibilitychange" /* DOM_EVENT.VISIBILITY_CHANGE */, expandSessionWhenVisible).stop;
    stopCallbacks.push(stop);
    var visibilityCheckInterval = setInterval(expandSessionWhenVisible, VISIBILITY_CHECK_DELAY);
    stopCallbacks.push(function () {
        clearInterval(visibilityCheckInterval);
    });
}
//# sourceMappingURL=sessionManager.js.map