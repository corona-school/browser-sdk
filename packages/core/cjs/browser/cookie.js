"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentSite = exports.areCookiesAuthorized = exports.deleteCookie = exports.getCookie = exports.setCookie = void 0;
var display_1 = require("../tools/display");
var timeUtils_1 = require("../tools/utils/timeUtils");
var stringUtils_1 = require("../tools/utils/stringUtils");
var cookieMap = new Map();
function setCookie(name, value, _expireDelay, _options) {
    cookieMap.set(name, value);
}
exports.setCookie = setCookie;
function getCookie(name) {
    return cookieMap.get(name);
}
exports.getCookie = getCookie;
function deleteCookie(name, _options) {
    cookieMap.delete(name);
}
exports.deleteCookie = deleteCookie;
function areCookiesAuthorized(options) {
    if (document.cookie === undefined || document.cookie === null) {
        return false;
    }
    try {
        // Use a unique cookie name to avoid issues when the SDK is initialized multiple times during
        // the test cookie lifetime
        var testCookieName = "dd_cookie_test_".concat((0, stringUtils_1.generateUUID)());
        var testCookieValue = 'test';
        setCookie(testCookieName, testCookieValue, timeUtils_1.ONE_MINUTE, options);
        var isCookieCorrectlySet = getCookie(testCookieName) === testCookieValue;
        deleteCookie(testCookieName, options);
        return isCookieCorrectlySet;
    }
    catch (error) {
        display_1.display.error(error);
        return false;
    }
}
exports.areCookiesAuthorized = areCookiesAuthorized;
/**
 * No API to retrieve it, number of levels for subdomain and suffix are unknown
 * strategy: find the minimal domain on which cookies are allowed to be set
 * https://web.dev/same-site-same-origin/#site
 */
var getCurrentSiteCache;
function getCurrentSite() {
    if (getCurrentSiteCache === undefined) {
        // Use a unique cookie name to avoid issues when the SDK is initialized multiple times during
        // the test cookie lifetime
        var testCookieName = "dd_site_test_".concat((0, stringUtils_1.generateUUID)());
        var testCookieValue = 'test';
        var domainLevels = window.location.hostname.split('.');
        var candidateDomain = domainLevels.pop();
        while (domainLevels.length && !getCookie(testCookieName)) {
            candidateDomain = "".concat(domainLevels.pop(), ".").concat(candidateDomain);
            setCookie(testCookieName, testCookieValue, timeUtils_1.ONE_SECOND, { domain: candidateDomain });
        }
        deleteCookie(testCookieName, { domain: candidateDomain });
        getCurrentSiteCache = candidateDomain;
    }
    return getCurrentSiteCache;
}
exports.getCurrentSite = getCurrentSite;
//# sourceMappingURL=cookie.js.map