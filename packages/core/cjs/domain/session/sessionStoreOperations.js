"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLockEnabled = exports.processSessionStoreOperations = exports.LOCK_MAX_TRIES = exports.LOCK_RETRY_DELAY = void 0;
var timer_1 = require("../../tools/timer");
var stringUtils_1 = require("../../tools/utils/stringUtils");
var browserDetection_1 = require("../../tools/utils/browserDetection");
var sessionState_1 = require("./sessionState");
exports.LOCK_RETRY_DELAY = 10;
exports.LOCK_MAX_TRIES = 100;
var bufferedOperations = [];
var ongoingOperations;
function processSessionStoreOperations(operations, sessionStoreStrategy, numberOfRetries) {
    var _a;
    if (numberOfRetries === void 0) { numberOfRetries = 0; }
    var retrieveSession = sessionStoreStrategy.retrieveSession, persistSession = sessionStoreStrategy.persistSession, clearSession = sessionStoreStrategy.clearSession;
    var lockEnabled = (0, exports.isLockEnabled)();
    if (!ongoingOperations) {
        ongoingOperations = operations;
    }
    if (operations !== ongoingOperations) {
        bufferedOperations.push(operations);
        return;
    }
    if (lockEnabled && numberOfRetries >= exports.LOCK_MAX_TRIES) {
        next(sessionStoreStrategy);
        return;
    }
    var currentLock;
    var currentSession = retrieveSession();
    if (lockEnabled) {
        // if someone has lock, retry later
        if (currentSession.lock) {
            retryLater(operations, sessionStoreStrategy, numberOfRetries);
            return;
        }
        // acquire lock
        currentLock = (0, stringUtils_1.generateUUID)();
        currentSession.lock = currentLock;
        persistSession(currentSession);
        // if lock is not acquired, retry later
        currentSession = retrieveSession();
        if (currentSession.lock !== currentLock) {
            retryLater(operations, sessionStoreStrategy, numberOfRetries);
            return;
        }
    }
    var processedSession = operations.process(currentSession);
    if (lockEnabled) {
        // if lock corrupted after process, retry later
        currentSession = retrieveSession();
        if (currentSession.lock !== currentLock) {
            retryLater(operations, sessionStoreStrategy, numberOfRetries);
            return;
        }
    }
    if (processedSession) {
        if ((0, sessionState_1.isSessionInExpiredState)(processedSession)) {
            clearSession();
        }
        else {
            (0, sessionState_1.expandSessionState)(processedSession);
            persistSession(processedSession);
        }
    }
    if (lockEnabled) {
        // correctly handle lock around expiration would require to handle this case properly at several levels
        // since we don't have evidence of lock issues around expiration, let's just not do the corruption check for it
        if (!(processedSession && (0, sessionState_1.isSessionInExpiredState)(processedSession))) {
            // if lock corrupted after persist, retry later
            currentSession = retrieveSession();
            if (currentSession.lock !== currentLock) {
                retryLater(operations, sessionStoreStrategy, numberOfRetries);
                return;
            }
            delete currentSession.lock;
            persistSession(currentSession);
            processedSession = currentSession;
        }
    }
    // call after even if session is not persisted in order to perform operations on
    // up-to-date session state value => the value could have been modified by another tab
    (_a = operations.after) === null || _a === void 0 ? void 0 : _a.call(operations, processedSession || currentSession);
    next(sessionStoreStrategy);
}
exports.processSessionStoreOperations = processSessionStoreOperations;
/**
 * Lock strategy allows mitigating issues due to concurrent access to cookie.
 * This issue concerns only chromium browsers and enabling this on firefox increases cookie write failures.
 */
var isLockEnabled = function () { return (0, browserDetection_1.isChromium)(); };
exports.isLockEnabled = isLockEnabled;
function retryLater(operations, sessionStore, currentNumberOfRetries) {
    (0, timer_1.setTimeout)(function () {
        processSessionStoreOperations(operations, sessionStore, currentNumberOfRetries + 1);
    }, exports.LOCK_RETRY_DELAY);
}
function next(sessionStore) {
    ongoingOperations = undefined;
    var nextOperations = bufferedOperations.shift();
    if (nextOperations) {
        processSessionStoreOperations(nextOperations, sessionStore);
    }
}
//# sourceMappingURL=sessionStoreOperations.js.map