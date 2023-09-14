"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContextManager = exports.BYTES_COMPUTATION_THROTTLING_DELAY = void 0;
var byteUtils_1 = require("../../tools/utils/byteUtils");
var functionUtils_1 = require("../../tools/utils/functionUtils");
var mergeInto_1 = require("../../tools/mergeInto");
var typeUtils_1 = require("../../tools/utils/typeUtils");
var jsonStringify_1 = require("../../tools/serialisation/jsonStringify");
var sanitize_1 = require("../../tools/serialisation/sanitize");
var observable_1 = require("../../tools/observable");
var heavyCustomerDataWarning_1 = require("./heavyCustomerDataWarning");
exports.BYTES_COMPUTATION_THROTTLING_DELAY = 200;
function createContextManager(customerDataType, computeBytesCountImpl) {
    if (computeBytesCountImpl === void 0) { computeBytesCountImpl = byteUtils_1.computeBytesCount; }
    var context = {};
    var bytesCountCache;
    var alreadyWarned = false;
    var changeObservable = new observable_1.Observable();
    // Throttle the bytes computation to minimize the impact on performance.
    // Especially useful if the user call context APIs synchronously multiple times in a row
    var computeBytesCountThrottled = (0, functionUtils_1.throttle)(function (context) {
        bytesCountCache = computeBytesCountImpl((0, jsonStringify_1.jsonStringify)(context));
        if (!alreadyWarned) {
            alreadyWarned = (0, heavyCustomerDataWarning_1.warnIfCustomerDataLimitReached)(bytesCountCache, customerDataType);
        }
    }, exports.BYTES_COMPUTATION_THROTTLING_DELAY).throttled;
    var contextManager = {
        getBytesCount: function () { return bytesCountCache; },
        /** @deprecated use getContext instead */
        get: function () { return context; },
        /** @deprecated use setContextProperty instead */
        add: function (key, value) {
            context[key] = value;
            computeBytesCountThrottled(context);
            changeObservable.notify();
        },
        /** @deprecated renamed to removeContextProperty */
        remove: function (key) {
            delete context[key];
            computeBytesCountThrottled(context);
            changeObservable.notify();
        },
        /** @deprecated use setContext instead */
        set: function (newContext) {
            context = newContext;
            computeBytesCountThrottled(context);
            changeObservable.notify();
        },
        getContext: function () { return (0, mergeInto_1.deepClone)(context); },
        setContext: function (newContext) {
            if ((0, typeUtils_1.getType)(newContext) === 'object') {
                context = (0, sanitize_1.sanitize)(newContext);
                computeBytesCountThrottled(context);
            }
            else {
                contextManager.clearContext();
            }
            changeObservable.notify();
        },
        setContextProperty: function (key, property) {
            context[key] = (0, sanitize_1.sanitize)(property);
            computeBytesCountThrottled(context);
            changeObservable.notify();
        },
        removeContextProperty: function (key) {
            delete context[key];
            computeBytesCountThrottled(context);
            changeObservable.notify();
        },
        clearContext: function () {
            context = {};
            bytesCountCache = 0;
            changeObservable.notify();
        },
        changeObservable: changeObservable,
    };
    return contextManager;
}
exports.createContextManager = createContextManager;
//# sourceMappingURL=contextManager.js.map