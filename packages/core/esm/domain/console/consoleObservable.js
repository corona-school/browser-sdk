import { computeStackTrace } from '../tracekit';
import { createHandlingStack, formatErrorMessage, toStackTraceString, tryToGetFingerprint } from '../error/error';
import { mergeObservables, Observable } from '../../tools/observable';
import { ConsoleApiName, globalConsole } from '../../tools/display';
import { callMonitored } from '../../tools/monitor';
import { sanitize } from '../../tools/serialisation/sanitize';
import { find } from '../../tools/utils/polyfills';
import { jsonStringify } from '../../tools/serialisation/jsonStringify';
var consoleObservablesByApi = {};
export function initConsoleObservable(apis) {
    var consoleObservables = apis.map(function (api) {
        if (!consoleObservablesByApi[api]) {
            consoleObservablesByApi[api] = createConsoleObservable(api);
        }
        return consoleObservablesByApi[api];
    });
    return mergeObservables.apply(void 0, consoleObservables);
}
export function resetConsoleObservable() {
    consoleObservablesByApi = {};
}
function createConsoleObservable(api) {
    var observable = new Observable(function () {
        var originalConsoleApi = globalConsole[api];
        globalConsole[api] = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            originalConsoleApi.apply(console, params);
            var handlingStack = createHandlingStack();
            callMonitored(function () {
                observable.notify(buildConsoleLog(params, api, handlingStack));
            });
        };
        return function () {
            globalConsole[api] = originalConsoleApi;
        };
    });
    return observable;
}
function buildConsoleLog(params, api, handlingStack) {
    // Todo: remove console error prefix in the next major version
    var message = params.map(function (param) { return formatConsoleParameters(param); }).join(' ');
    var stack;
    var fingerprint;
    if (api === ConsoleApiName.error) {
        var firstErrorParam = find(params, function (param) { return param instanceof Error; });
        stack = firstErrorParam ? toStackTraceString(computeStackTrace(firstErrorParam)) : undefined;
        fingerprint = tryToGetFingerprint(firstErrorParam);
        message = "console error: ".concat(message);
    }
    return {
        api: api,
        message: message,
        stack: stack,
        handlingStack: handlingStack,
        fingerprint: fingerprint,
    };
}
function formatConsoleParameters(param) {
    if (typeof param === 'string') {
        return sanitize(param);
    }
    if (param instanceof Error) {
        return formatErrorMessage(computeStackTrace(param));
    }
    return jsonStringify(sanitize(param), undefined, 2);
}
//# sourceMappingURL=consoleObservable.js.map