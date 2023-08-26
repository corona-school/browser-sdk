import { display } from '../tools/display';
import { ONE_MINUTE, ONE_SECOND } from '../tools/utils/timeUtils';
import { generateUUID } from '../tools/utils/stringUtils';
export function setCookie(name, value, _expireDelay, _options) {
    sessionStorage.setItem(name, value);
}
export function getCookie(name) {
    return sessionStorage.getItem(name);
}
export function deleteCookie(name, _options) {
    sessionStorage.removeItem(name);
}
export function areCookiesAuthorized(options) {
    if (document.cookie === undefined || document.cookie === null) {
        return false;
    }
    try {
        // Use a unique cookie name to avoid issues when the SDK is initialized multiple times during
        // the test cookie lifetime
        var testCookieName = "dd_cookie_test_".concat(generateUUID());
        var testCookieValue = 'test';
        setCookie(testCookieName, testCookieValue, ONE_MINUTE, options);
        var isCookieCorrectlySet = getCookie(testCookieName) === testCookieValue;
        deleteCookie(testCookieName, options);
        return isCookieCorrectlySet;
    }
    catch (error) {
        display.error(error);
        return false;
    }
}
/**
 * No API to retrieve it, number of levels for subdomain and suffix are unknown
 * strategy: find the minimal domain on which cookies are allowed to be set
 * https://web.dev/same-site-same-origin/#site
 */
var getCurrentSiteCache;
export function getCurrentSite() {
    if (getCurrentSiteCache === undefined) {
        // Use a unique cookie name to avoid issues when the SDK is initialized multiple times during
        // the test cookie lifetime
        var testCookieName = "dd_site_test_".concat(generateUUID());
        var testCookieValue = 'test';
        var domainLevels = window.location.hostname.split('.');
        var candidateDomain = domainLevels.pop();
        while (domainLevels.length && !getCookie(testCookieName)) {
            candidateDomain = "".concat(domainLevels.pop(), ".").concat(candidateDomain);
            setCookie(testCookieName, testCookieValue, ONE_SECOND, { domain: candidateDomain });
        }
        deleteCookie(testCookieName, { domain: candidateDomain });
        getCurrentSiteCache = candidateDomain;
    }
    return getCurrentSiteCache;
}
//# sourceMappingURL=cookie.js.map