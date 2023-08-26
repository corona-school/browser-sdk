import { getCurrentSite, areCookiesAuthorized, deleteCookie, getCookie, setCookie } from '../../../browser/cookie';
import { tryOldCookiesMigration } from '../oldCookiesMigration';
import { SESSION_EXPIRATION_DELAY } from '../sessionConstants';
import { toSessionString, toSessionState } from '../sessionState';
import { SESSION_STORE_KEY } from './sessionStoreStrategy';
export function selectCookieStrategy(initConfiguration) {
    var cookieOptions = buildCookieOptions(initConfiguration);
    return areCookiesAuthorized(cookieOptions) ? { type: 'Cookie', cookieOptions: cookieOptions } : undefined;
}
export function initCookieStrategy(cookieOptions) {
    var cookieStore = {
        persistSession: persistSessionCookie(cookieOptions),
        retrieveSession: retrieveSessionCookie,
        clearSession: deleteSessionCookie(cookieOptions),
    };
    tryOldCookiesMigration(cookieStore);
    return cookieStore;
}
function persistSessionCookie(options) {
    return function (session) {
        setCookie(SESSION_STORE_KEY, toSessionString(session), SESSION_EXPIRATION_DELAY, options);
    };
}
function retrieveSessionCookie() {
    var sessionString = getCookie(SESSION_STORE_KEY);
    return toSessionState(sessionString);
}
function deleteSessionCookie(options) {
    return function () {
        deleteCookie(SESSION_STORE_KEY, options);
    };
}
export function buildCookieOptions(initConfiguration) {
    var cookieOptions = {};
    cookieOptions.secure = !!initConfiguration.useSecureSessionCookie || !!initConfiguration.useCrossSiteSessionCookie;
    cookieOptions.crossSite = !!initConfiguration.useCrossSiteSessionCookie;
    if (initConfiguration.trackSessionAcrossSubdomains) {
        cookieOptions.domain = getCurrentSite();
    }
    return cookieOptions;
}
//# sourceMappingURL=sessionInCookie.js.map