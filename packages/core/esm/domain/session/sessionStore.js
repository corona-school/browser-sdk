import { clearInterval, setInterval } from '../../tools/timer';
import { Observable } from '../../tools/observable';
import { ONE_SECOND, dateNow } from '../../tools/utils/timeUtils';
import { throttle } from '../../tools/utils/functionUtils';
import { generateUUID } from '../../tools/utils/stringUtils';
import { SESSION_TIME_OUT_DELAY } from './sessionConstants';
import { selectCookieStrategy, initCookieStrategy } from './storeStrategies/sessionInCookie';
import { initLocalStorageStrategy, selectLocalStorageStrategy } from './storeStrategies/sessionInLocalStorage';
import { processSessionStoreOperations } from './sessionStoreOperations';
/**
 * Every second, the storage will be polled to check for any change that can occur
 * to the session state in another browser tab, or another window.
 * This value has been determined from our previous cookie-only implementation.
 */
export var STORAGE_POLL_DELAY = ONE_SECOND;
/**
 * Checks if cookies are available as the preferred storage
 * Else, checks if LocalStorage is allowed and available
 */
export function selectSessionStoreStrategyType(initConfiguration) {
    var sessionStoreStrategyType = selectCookieStrategy(initConfiguration);
    if (!sessionStoreStrategyType && initConfiguration.allowFallbackToLocalStorage) {
        sessionStoreStrategyType = selectLocalStorageStrategy();
    }
    return sessionStoreStrategyType;
}
/**
 * Different session concepts:
 * - tracked, the session has an id and is updated along the user navigation
 * - not tracked, the session does not have an id but it is updated along the user navigation
 * - inactive, no session in store or session expired, waiting for a renew session
 */
export function startSessionStore(sessionStoreStrategyType, productKey, computeSessionState) {
    var renewObservable = new Observable();
    var expireObservable = new Observable();
    var sessionStoreStrategy = sessionStoreStrategyType.type === 'Cookie'
        ? initCookieStrategy(sessionStoreStrategyType.cookieOptions)
        : initLocalStorageStrategy();
    var clearSession = sessionStoreStrategy.clearSession, retrieveSession = sessionStoreStrategy.retrieveSession;
    var watchSessionTimeoutId = setInterval(watchSession, STORAGE_POLL_DELAY);
    var sessionCache = retrieveActiveSession();
    function expandOrRenewSession() {
        var isTracked;
        processSessionStoreOperations({
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
        processSessionStoreOperations({
            process: function (sessionState) { return (hasSessionInCache() ? synchronizeSession(sessionState) : undefined); },
        }, sessionStoreStrategy);
    }
    /**
     * allows two behaviors:
     * - if the session is active, synchronize the session cache without updating the session store
     * - if the session is not active, clear the session store and expire the session cache
     */
    function watchSession() {
        processSessionStoreOperations({
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
            sessionState.id = generateUUID();
            sessionState.created = String(dateNow());
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
        return ((sessionState.created === undefined || dateNow() - Number(sessionState.created) < SESSION_TIME_OUT_DELAY) &&
            (sessionState.expire === undefined || dateNow() < Number(sessionState.expire)));
    }
    return {
        expandOrRenewSession: throttle(expandOrRenewSession, STORAGE_POLL_DELAY).throttled,
        expandSession: expandSession,
        getSession: function () { return sessionCache; },
        renewObservable: renewObservable,
        expireObservable: expireObservable,
        expire: function () {
            clearSession();
            synchronizeSession({});
        },
        stop: function () {
            clearInterval(watchSessionTimeoutId);
        },
    };
}
//# sourceMappingURL=sessionStore.js.map