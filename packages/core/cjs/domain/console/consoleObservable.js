"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetConsoleObservable = exports.initConsoleObservable = void 0;
var tracekit_1 = require("../tracekit");
var error_1 = require("../error/error");
var observable_1 = require("../../tools/observable");
var display_1 = require("../../tools/display");
var monitor_1 = require("../../tools/monitor");
var sanitize_1 = require("../../tools/serialisation/sanitize");
var polyfills_1 = require("../../tools/utils/polyfills");
var jsonStringify_1 = require("../../tools/serialisation/jsonStringify");
var consoleObservablesByApi = {};
function initConsoleObservable(apis) {
    var consoleObservables = apis.map(function (api) {
        if (!consoleObservablesByApi[api]) {
            consoleObservablesByApi[api] = createConsoleObservable(api);
        }
        return consoleObservablesByApi[api];
    });
    return observable_1.mergeObservables.apply(void 0, consoleObservables);
}
exports.initConsoleObservable = initConsoleObservable;
function resetConsoleObservable() {
    consoleObservablesByApi = {};
}
exports.resetConsoleObservable = resetConsoleObservable;
function createConsoleObservable(api) {
    var observable = new observable_1.Observable(function () {
        var originalConsoleApi = display_1.globalConsole[api];
        display_1.globalConsole[api] = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            originalConsoleApi.apply(console, params);
            var handlingStack = (0, error_1.createHandlingStack)();
            (0, monitor_1.callMonitored)(function () {
                observable.notify(buildConsoleLog(params, api, handlingStack));
            });
        };
        return function () {
            display_1.globalConsole[api] = originalConsoleApi;
        };
    });
    return observable;
}
function buildConsoleLog(params, api, handlingStack) {
    // Todo: remove console error prefix in the next major version
    var message = params.map(function (param) { return formatConsoleParameters(param); }).join(' ');
    var stack;
    var fingerprint;
    if (api === display_1.ConsoleApiName.error) {
        var firstErrorParam = (0, polyfills_1.find)(params, function (param) { return param instanceof Error; });
        stack = firstErrorParam ? (0, error_1.toStackTraceString)((0, tracekit_1.computeStackTrace)(firstErrorParam)) : undefined;
        fingerprint = (0, error_1.tryToGetFingerprint)(firstErrorParam);
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
        return (0, sanitize_1.sanitize)(param);
    }
    if (param instanceof Error) {
        return (0, error_1.formatErrorMessage)((0, tracekit_1.computeStackTrace)(param));
    }
    return (0, jsonStringify_1.jsonStringify)((0, sanitize_1.sanitize)(param), undefined, 2);
}
//# sourceMappingURL=consoleObservable.js.map