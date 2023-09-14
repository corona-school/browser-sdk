"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopSessionManager = exports.startSessionManager = exports.VISIBILITY_CHECK_DELAY = void 0;
var valueHistory_1 = require("../../tools/valueHistory");
var timeUtils_1 = require("../../tools/utils/timeUtils");
var addEventListener_1 = require("../../browser/addEventListener");
var timer_1 = require("../../tools/timer");
var sessionConstants_1 = require("./sessionConstants");
var sessionStore_1 = require("./sessionStore");
exports.VISIBILITY_CHECK_DELAY = timeUtils_1.ONE_MINUTE;
var SESSION_CONTEXT_TIMEOUT_DELAY = sessionConstants_1.SESSION_TIME_OUT_DELAY;
var stopCallbacks = [];
function startSessionManager(configuration, productKey, computeSessionState) {
    // TODO - Improve configuration type and remove assertion
    var sessionStore = (0, sessionStore_1.startSessionStore)(configuration.sessionStoreStrategyType, productKey, computeSessionState);
    stopCallbacks.push(function () { return sessionStore.stop(); });
    var sessionContextHistory = new valueHistory_1.ValueHistory(SESSION_CONTEXT_TIMEOUT_DELAY);
    stopCallbacks.push(function () { return sessionContextHistory.stop(); });
    sessionStore.renewObservable.subscribe(function () {
        sessionContextHistory.add(buildSessionContext(), (0, timeUtils_1.relativeNow)());
    });
    sessionStore.expireObservable.subscribe(function () {
        sessionContextHistory.closeActive((0, timeUtils_1.relativeNow)());
    });
    sessionStore.expandOrRenewSession();
    sessionContextHistory.add(buildSessionContext(), (0, timeUtils_1.clocksOrigin)().relative);
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
exports.startSessionManager = startSessionManager;
function stopSessionManager() {
    stopCallbacks.forEach(function (e) { return e(); });
    stopCallbacks = [];
}
exports.stopSessionManager = stopSessionManager;
function trackActivity(configuration, expandOrRenewSession) {
    var stop = (0, addEventListener_1.addEventListeners)(configuration, window, ["click" /* DOM_EVENT.CLICK */, "touchstart" /* DOM_EVENT.TOUCH_START */, "keydown" /* DOM_EVENT.KEY_DOWN */, "scroll" /* DOM_EVENT.SCROLL */], expandOrRenewSession, { capture: true, passive: true }).stop;
    stopCallbacks.push(stop);
}
function trackVisibility(configuration, expandSession) {
    var expandSessionWhenVisible = function () {
        if (document.visibilityState === 'visible') {
            expandSession();
        }
    };
    var stop = (0, addEventListener_1.addEventListener)(configuration, document, "visibilitychange" /* DOM_EVENT.VISIBILITY_CHANGE */, expandSessionWhenVisible).stop;
    stopCallbacks.push(stop);
    var visibilityCheckInterval = (0, timer_1.setInterval)(expandSessionWhenVisible, exports.VISIBILITY_CHECK_DELAY);
    stopCallbacks.push(function () {
        (0, timer_1.clearInterval)(visibilityCheckInterval);
    });
}
//# sourceMappingURL=sessionManager.js.map