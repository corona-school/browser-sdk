"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSessionStore = exports.selectSessionStoreStrategyType = exports.STORAGE_POLL_DELAY = void 0;
var timer_1 = require("../../tools/timer");
var observable_1 = require("../../tools/observable");
var timeUtils_1 = require("../../tools/utils/timeUtils");
var functionUtils_1 = require("../../tools/utils/functionUtils");
var stringUtils_1 = require("../../tools/utils/stringUtils");
var sessionConstants_1 = require("./sessionConstants");
var sessionInCookie_1 = require("./storeStrategies/sessionInCookie");
var sessionInLocalStorage_1 = require("./storeStrategies/sessionInLocalStorage");
var sessionStoreOperations_1 = require("./sessionStoreOperations");
/**
 * Every second, the storage will be polled to check for any change that can occur
 * to the session state in another browser tab, or another window.
 * This value has been determined from our previous cookie-only implementation.
 */
exports.STORAGE_POLL_DELAY = timeUtils_1.ONE_SECOND;
/**
 * Checks if cookies are available as the preferred storage
 * Else, checks if LocalStorage is allowed and available
 */
function selectSessionStoreStrategyType(initConfiguration) {
    var sessionStoreStrategyType = (0, sessionInCookie_1.selectCookieStrategy)(initConfiguration);
    if (!sessionStoreStrategyType && initConfiguration.allowFallbackToLocalStorage) {
        sessionStoreStrategyType = (0, sessionInLocalStorage_1.selectLocalStorageStrategy)();
    }
    return sessionStoreStrategyType;
}
exports.selectSessionStoreStrategyType = selectSessionStoreStrategyType;
/**
 * Different session concepts:
 * - tracked, the session has an id and is updated along the user navigation
 * - not tracked, the session does not have an id but it is updated along the user navigation
 * - inactive, no session in store or session expired, waiting for a renew session
 */
function startSessionStore(sessionStoreStrategyType, productKey, computeSessionState) {
    var renewObservable = new observable_1.Observable();
    var expireObservable = new observable_1.Observable();
    var sessionStoreStrategy = sessionStoreStrategyType.type === 'Cookie'
        ? (0, sessionInCookie_1.initCookieStrategy)(sessionStoreStrategyType.cookieOptions)
        : (0, sessionInLocalStorage_1.initLocalStorageStrategy)();
    var clearSession = sessionStoreStrategy.clearSession, retrieveSession = sessionStoreStrategy.retrieveSession;
    var watchSessionTimeoutId = (0, timer_1.setInterval)(watchSession, exports.STORAGE_POLL_DELAY);
    var sessionCache = retrieveActiveSession();
    function expandOrRenewSession() {
        var isTracked;
        (0, sessionStoreOperations_1.processSessionStoreOperations)({
            process: function (sessionState) {
                var synchronizedSession = synchronizeSession(sessionState);
                isTracked = expandOrRenewSessionState(synchronizedSession);
                return synchronizedSession;
            },
            after: function (sessionState) {
                if (isTracked && !hasSessionInCache()) {
                    renewSessionInCache(sessionState);
                }
                sessionCache = sessionState;
            },
        }, sessionStoreStrategy);
    }
    function expandSession() {
        (0, sessionStoreOperations_1.processSessionStoreOperations)({
            process: function (sessionState) { return (hasSessionInCache() ? synchronizeSession(sessionState) : undefined); },
        }, sessionStoreStrategy);
    }
    /**
     * allows two behaviors:
     * - if the session is active, synchronize the session cache without updating the session store
     * - if the session is not active, clear the session store and expire the session cache
     */
    function watchSession() {
        (0, sessionStoreOperations_1.processSessionStoreOperations)({
            process: function (sessionState) { return (!isActiveSession(sessionState) ? {} : undefined); },
            after: synchronizeSession,
        }, sessionStoreStrategy);
    }
    function synchronizeSession(sessionState) {
        if (!isActiveSession(sessionState)) {
            sessionState = {};
        }
        if (hasSessionInCache()) {
            if (isSessionInCacheOutdated(sessionState)) {
                expireSessionInCache();
            }
            else {
                sessionCache = sessionState;
            }
        }
        return sessionState;
    }
    function expandOrRenewSessionState(sessionState) {
        var _a = computeSessionState(sessionState[productKey]), trackingType = _a.trackingType, isTracked = _a.isTracked;
        sessionState[productKey] = trackingType;
        if (isTracked && !sessionState.id) {
            sessionState.id = (0, stringUtils_1.generateUUID)();
            sessionState.created = String((0, timeUtils_1.dateNow)());
        }
        return isTracked;
    }
    function hasSessionInCache() {
        return sessionCache[productKey] !== undefined;
    }
    function isSessionInCacheOutdated(sessionState) {
        return sessionCache.id !== sessionState.id || sessionCache[productKey] !== sessionState[productKey];
    }
    function expireSessionInCache() {
        sessionCache = {};
        expireObservable.notify();
    }
    function renewSessionInCache(sessionState) {
        sessionCache = sessionState;
        renewObservable.notify();
    }
    function retrieveActiveSession() {
        var session = retrieveSession();
        if (isActiveSession(session)) {
            return session;
        }
        return {};
    }
    function isActiveSession(sessionState) {
        // created and expire can be undefined for versions which was not storing them
        // these checks could be removed when older versions will not be available/live anymore
        return ((sessionState.created === undefined || (0, timeUtils_1.dateNow)() - Number(sessionState.created) < sessionConstants_1.SESSION_TIME_OUT_DELAY) &&
            (sessionState.expire === undefined || (0, timeUtils_1.dateNow)() < Number(sessionState.expire)));
    }
    return {
        expandOrRenewSession: (0, functionUtils_1.throttle)(expandOrRenewSession, exports.STORAGE_POLL_DELAY).throttled,
        expandSession: expandSession,
        getSession: function () { return sessionCache; },
        renewObservable: renewObservable,
        expireObservable: expireObservable,
        expire: function () {
            clearSession();
            synchronizeSession({});
        },
        stop: function () {
            (0, timer_1.clearInterval)(watchSessionTimeoutId);
        },
    };
}
exports.startSessionStore = startSessionStore;
//# sourceMappingURL=sessionStore.js.map