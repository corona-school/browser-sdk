"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCookieOptions = exports.initCookieStrategy = exports.selectCookieStrategy = void 0;
var cookie_1 = require("../../../browser/cookie");
var oldCookiesMigration_1 = require("../oldCookiesMigration");
var sessionConstants_1 = require("../sessionConstants");
var sessionState_1 = require("../sessionState");
var sessionStoreStrategy_1 = require("./sessionStoreStrategy");
function selectCookieStrategy(initConfiguration) {
    var cookieOptions = buildCookieOptions(initConfiguration);
    return (0, cookie_1.areCookiesAuthorized)(cookieOptions) ? { type: 'Cookie', cookieOptions: cookieOptions } : undefined;
}
exports.selectCookieStrategy = selectCookieStrategy;
function initCookieStrategy(cookieOptions) {
    var cookieStore = {
        persistSession: persistSessionCookie(cookieOptions),
        retrieveSession: retrieveSessionCookie,
        clearSession: deleteSessionCookie(cookieOptions),
    };
    (0, oldCookiesMigration_1.tryOldCookiesMigration)(cookieStore);
    return cookieStore;
}
exports.initCookieStrategy = initCookieStrategy;
function persistSessionCookie(options) {
    return function (session) {
        (0, cookie_1.setCookie)(sessionStoreStrategy_1.SESSION_STORE_KEY, (0, sessionState_1.toSessionString)(session), sessionConstants_1.SESSION_EXPIRATION_DELAY, options);
    };
}
function retrieveSessionCookie() {
    var sessionString = (0, cookie_1.getCookie)(sessionStoreStrategy_1.SESSION_STORE_KEY);
    return (0, sessionState_1.toSessionState)(sessionString);
}
function deleteSessionCookie(options) {
    return function () {
        (0, cookie_1.deleteCookie)(sessionStoreStrategy_1.SESSION_STORE_KEY, options);
    };
}
function buildCookieOptions(initConfiguration) {
    var cookieOptions = {};
    cookieOptions.secure = !!initConfiguration.useSecureSessionCookie || !!initConfiguration.useCrossSiteSessionCookie;
    cookieOptions.crossSite = !!initConfiguration.useCrossSiteSessionCookie;
    if (initConfiguration.trackSessionAcrossSubdomains) {
        cookieOptions.domain = (0, cookie_1.getCurrentSite)();
    }
    return cookieOptions;
}
exports.buildCookieOptions = buildCookieOptions;
//# sourceMappingURL=sessionInCookie.js.map