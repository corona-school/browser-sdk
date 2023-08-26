import { getCookie } from '../../browser/cookie';
import { SESSION_STORE_KEY } from './storeStrategies/sessionStoreStrategy';
import { expandSessionState, isSessionInExpiredState } from './sessionState';
export var OLD_SESSION_COOKIE_NAME = '_dd';
export var OLD_RUM_COOKIE_NAME = '_dd_r';
export var OLD_LOGS_COOKIE_NAME = '_dd_l';
// duplicate values to avoid dependency issues
export var RUM_SESSION_KEY = 'rum';
export var LOGS_SESSION_KEY = 'logs';
/**
 * This migration should remain in the codebase as long as older versions are available/live
 * to allow older sdk versions to be upgraded to newer versions without compatibility issues.
 */
export function tryOldCookiesMigration(cookieStoreStrategy) {
    var sessionString = getCookie(SESSION_STORE_KEY);
    if (!sessionString) {
        var oldSessionId = getCookie(OLD_SESSION_COOKIE_NAME);
        var oldRumType = getCookie(OLD_RUM_COOKIE_NAME);
        var oldLogsType = getCookie(OLD_LOGS_COOKIE_NAME);
        var session = {};
        if (oldSessionId) {
            session.id = oldSessionId;
        }
        if (oldLogsType && /^[01]$/.test(oldLogsType)) {
            session[LOGS_SESSION_KEY] = oldLogsType;
        }
        if (oldRumType && /^[012]$/.test(oldRumType)) {
            session[RUM_SESSION_KEY] = oldRumType;
        }
        if (!isSessionInExpiredState(session)) {
            expandSessionState(session);
            cookieStoreStrategy.persistSession(session);
        }
    }
}
//# sourceMappingURL=oldCookiesMigration.js.map