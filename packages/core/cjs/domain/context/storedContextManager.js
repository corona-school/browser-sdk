"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeStorageListeners = exports.buildStorageKey = exports.createStoredContextManager = void 0;
var byteUtils_1 = require("../../tools/utils/byteUtils");
var addEventListener_1 = require("../../browser/addEventListener");
var contextManager_1 = require("./contextManager");
var CONTEXT_STORE_KEY_PREFIX = '_dd_c';
var storageListeners = [];
function createStoredContextManager(configuration, productKey, customerDataType, computeBytesCountImpl) {
    if (computeBytesCountImpl === void 0) { computeBytesCountImpl = byteUtils_1.computeBytesCount; }
    var storageKey = buildStorageKey(productKey, customerDataType);
    var contextManager = (0, contextManager_1.createContextManager)(customerDataType, computeBytesCountImpl);
    synchronizeWithStorage();
    storageListeners.push((0, addEventListener_1.addEventListener)(configuration, window, "storage" /* DOM_EVENT.STORAGE */, function (_a) {
        var key = _a.key;
        if (storageKey === key) {
            synchronizeWithStorage();
        }
    }));
    contextManager.changeObservable.subscribe(dumpToStorage);
    return contextManager;
    function synchronizeWithStorage() {
        var rawContext = localStorage.getItem(storageKey);
        var context = rawContext !== null ? JSON.parse(rawContext) : {};
        contextManager.setContext(context);
    }
    function dumpToStorage() {
        localStorage.setItem(storageKey, JSON.stringify(contextManager.getContext()));
    }
}
exports.createStoredContextManager = createStoredContextManager;
function buildStorageKey(productKey, customerDataType) {
    return "".concat(CONTEXT_STORE_KEY_PREFIX, "_").concat(productKey, "_").concat(customerDataType);
}
exports.buildStorageKey = buildStorageKey;
function removeStorageListeners() {
    storageListeners.map(function (listener) { return listener.stop(); });
}
exports.removeStorageListeners = removeStorageListeners;
//# sourceMappingURL=storedContextManager.js.map