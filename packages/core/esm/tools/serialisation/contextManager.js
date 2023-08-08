import { computeBytesCount } from '../utils/byteUtils';
import { throttle } from '../utils/functionUtils';
import { deepClone } from '../mergeInto';
import { getType } from '../utils/typeUtils';
import { jsonStringify } from './jsonStringify';
import { sanitize } from './sanitize';
import { warnIfCustomerDataLimitReached } from './heavyCustomerDataWarning';
export var BYTES_COMPUTATION_THROTTLING_DELAY = 200;
export function createContextManager(customerDataType, computeBytesCountImpl) {
    if (computeBytesCountImpl === void 0) { computeBytesCountImpl = computeBytesCount; }
    var context = {};
    var bytesCountCache;
    var alreadyWarned = false;
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
        },
        /** @deprecated renamed to removeContextProperty */
        remove: function (key) {
            delete context[key];
            computeBytesCountThrottled(context);
        },
        /** @deprecated use setContext instead */
        set: function (newContext) {
            context = newContext;
            computeBytesCountThrottled(context);
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
        },
        setContextProperty: function (key, property) {
            context[key] = sanitize(property);
            computeBytesCountThrottled(context);
        },
        removeContextProperty: function (key) {
            delete context[key];
            computeBytesCountThrottled(context);
        },
        clearContext: function () {
            context = {};
            bytesCountCache = 0;
        },
    };
    return contextManager;
}
//# sourceMappingURL=contextManager.js.map