import { computeBytesCount } from '../../tools/utils/byteUtils';
import { addEventListener } from '../../browser/addEventListener';
import { createContextManager } from './contextManager';
var CONTEXT_STORE_KEY_PREFIX = '_dd_c';
var storageListeners = [];
export function createStoredContextManager(configuration, productKey, customerDataType, computeBytesCountImpl) {
    if (computeBytesCountImpl === void 0) { computeBytesCountImpl = computeBytesCount; }
    var storageKey = buildStorageKey(productKey, customerDataType);
    var contextManager = createContextManager(customerDataType, computeBytesCountImpl);
    synchronizeWithStorage();
    storageListeners.push(addEventListener(configuration, window, "storage" /* DOM_EVENT.STORAGE */, function (_a) {
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
export function buildStorageKey(productKey, customerDataType) {
    return "".concat(CONTEXT_STORE_KEY_PREFIX, "_").concat(productKey, "_").concat(customerDataType);
}
export function removeStorageListeners() {
    storageListeners.map(function (listener) { return listener.stop(); });
}
//# sourceMappingURL=storedContextManager.js.map