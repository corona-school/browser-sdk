"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSessionState = exports.toSessionString = exports.expandSessionState = exports.isSessionInExpiredState = void 0;
var objectUtils_1 = require("../../tools/utils/objectUtils");
var polyfills_1 = require("../../tools/utils/polyfills");
var timeUtils_1 = require("../../tools/utils/timeUtils");
var sessionConstants_1 = require("./sessionConstants");
var SESSION_ENTRY_REGEXP = /^([a-z]+)=([a-z0-9-]+)$/;
var SESSION_ENTRY_SEPARATOR = '&';
function isSessionInExpiredState(session) {
    return (0, objectUtils_1.isEmptyObject)(session);
}
exports.isSessionInExpiredState = isSessionInExpiredState;
function expandSessionState(session) {
    session.expire = String((0, timeUtils_1.dateNow)() + sessionConstants_1.SESSION_EXPIRATION_DELAY);
}
exports.expandSessionState = expandSessionState;
function toSessionString(session) {
    return (0, polyfills_1.objectEntries)(session)
        .map(function (_a) {
        var key = _a[0], value = _a[1];
        return "".concat(key, "=").concat(value);
    })
        .join(SESSION_ENTRY_SEPARATOR);
}
exports.toSessionString = toSessionString;
function toSessionState(sessionString) {
    var session = {};
    if (isValidSessionString(sessionString)) {
        sessionString.split(SESSION_ENTRY_SEPARATOR).forEach(function (entry) {
            var matches = SESSION_ENTRY_REGEXP.exec(entry);
            if (matches !== null) {
                var key = matches[1], value = matches[2];
                session[key] = value;
            }
        });
    }
    return session;
}
exports.toSessionState = toSessionState;
function isValidSessionString(sessionString) {
    return (!!sessionString &&
        (sessionString.indexOf(SESSION_ENTRY_SEPARATOR) !== -1 || SESSION_ENTRY_REGEXP.test(sessionString)));
}
//# sourceMappingURL=sessionState.js.map