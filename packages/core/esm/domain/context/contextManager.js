import { computeBytesCount } from '../../tools/utils/byteUtils';
import { throttle } from '../../tools/utils/functionUtils';
import { deepClone } from '../../tools/mergeInto';
import { getType } from '../../tools/utils/typeUtils';
import { jsonStringify } from '../../tools/serialisation/jsonStringify';
import { sanitize } from '../../tools/serialisation/sanitize';
import { Observable } from '../../tools/observable';
import { warnIfCustomerDataLimitReached } from './heavyCustomerDataWarning';
export var BYTES_COMPUTATION_THROTTLING_DELAY = 200;
export function createContextManager(customerDataType, computeBytesCountImpl) {
    if (computeBytesCountImpl === void 0) { computeBytesCountImpl = computeBytesCount; }
    var context = {};
    var bytesCountCache;
    var alreadyWarned = false;
    var changeObservable = new Observable();
    // Throttle the bytes computation to minimize the impact on performance.
    // Especially useful if the user call context APIs synchronously multiple times in a row
    var computeBytesCountThrottled = throttle(function (context) {
        bytesCountCache = computeBytesCountImpl(jsonStringify(context));
        if (!alreadyWarned) {
            alreadyWarned = warnIfCustomerDataLimitReached(bytesCountCache, customerDataType);
        }
    }, BYTES_COMPUTATION_THROTTLING_DELAY).throttled;
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
        getContext: function () { return deepClone(context); },
        setContext: function (newContext) {
            if (getType(newContext) === 'object') {
                context = sanitize(newContext);
                computeBytesCountThrottled(context);
            }
            else {
                contextManager.clearContext();
            }
            changeObservable.notify();
        },
        setContextProperty: function (key, property) {
            context[key] = sanitize(property);
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
//# sourceMappingURL=contextManager.js.map