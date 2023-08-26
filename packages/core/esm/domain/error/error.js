import { computeStackTrace } from '../tracekit';
import { callMonitored } from '../../tools/monitor';
import { sanitize } from '../../tools/serialisation/sanitize';
import { noop } from '../../tools/utils/functionUtils';
import { jsonStringify } from '../../tools/serialisation/jsonStringify';
export var NO_ERROR_STACK_PRESENT_MESSAGE = 'No stack, consider using an instance of Error';
export function computeRawError(_a) {
    var stackTrace = _a.stackTrace, originalError = _a.originalError, handlingStack = _a.handlingStack, startClocks = _a.startClocks, nonErrorPrefix = _a.nonErrorPrefix, source = _a.source, handling = _a.handling;
    var isErrorInstance = originalError instanceof Error;
    var message = computeMessage(stackTrace, isErrorInstance, nonErrorPrefix, originalError);
    var stack = hasUsableStack(isErrorInstance, stackTrace)
        ? toStackTraceString(stackTrace)
        : NO_ERROR_STACK_PRESENT_MESSAGE;
    var causes = isErrorInstance ? flattenErrorCauses(originalError, source) : undefined;
    var type = stackTrace === null || stackTrace === void 0 ? void 0 : stackTrace.name;
    var fingerprint = tryToGetFingerprint(originalError);
    return {
        startClocks: startClocks,
        source: source,
        handling: handling,
        handlingStack: handlingStack,
        originalError: originalError,
        type: type,
        message: message,
        stack: stack,
        causes: causes,
        fingerprint: fingerprint,
    };
}
function computeMessage(stackTrace, isErrorInstance, nonErrorPrefix, originalError) {
    // Favor stackTrace message only if tracekit has really been able to extract something meaningful (message + name)
    // TODO rework tracekit integration to avoid scattering error building logic
    return (stackTrace === null || stackTrace === void 0 ? void 0 : stackTrace.message) && (stackTrace === null || stackTrace === void 0 ? void 0 : stackTrace.name)
        ? stackTrace.message
        : !isErrorInstance
            ? "".concat(nonErrorPrefix, " ").concat(jsonStringify(sanitize(originalError)))
            : 'Empty message';
}
function hasUsableStack(isErrorInstance, stackTrace) {
    if (stackTrace === undefined) {
        return false;
    }
    if (isErrorInstance) {
        return true;
    }
    // handle cases where tracekit return stack = [] or stack = [{url: undefined, line: undefined, column: undefined}]
    // TODO rework tracekit integration to avoid generating those unusable stack
    return stackTrace.stack.length > 0 && (stackTrace.stack.length > 1 || stackTrace.stack[0].url !== undefined);
}
export function tryToGetFingerprint(originalError) {
    return originalError instanceof Error && 'dd_fingerprint' in originalError
        ? String(originalError.dd_fingerprint)
        : undefined;
}
export function toStackTraceString(stack) {
    var result = formatErrorMessage(stack);
    stack.stack.forEach(function (frame) {
        var func = frame.func === '?' ? '<anonymous>' : frame.func;
        var args = frame.args && frame.args.length > 0 ? "(".concat(frame.args.join(', '), ")") : '';
        var line = frame.line ? ":".concat(frame.line) : '';
        var column = frame.line && frame.column ? ":".concat(frame.column) : '';
        result += "\n  at ".concat(func).concat(args, " @ ").concat(frame.url).concat(line).concat(column);
    });
    return result;
}
export function getFileFromStackTraceString(stack) {
    var _a;
    return (_a = /@ (.+)/.exec(stack)) === null || _a === void 0 ? void 0 : _a[1];
}
export function formatErrorMessage(stack) {
    return "".concat(stack.name || 'Error', ": ").concat(stack.message);
}
/**
 Creates a stacktrace without SDK internal frames.
 
 Constraints:
 - Has to be called at the utmost position of the call stack.
 - No monitored function should encapsulate it, that is why we need to use callMonitored inside it.
 */
export function createHandlingStack() {
    /**
     * Skip the two internal frames:
     * - SDK API (console.error, ...)
     * - this function
     * in order to keep only the user calls
     */
    var internalFramesToSkip = 2;
    var error = new Error();
    var formattedStack;
    // IE needs to throw the error to fill in the stack trace
    if (!error.stack) {
        try {
            throw error;
        }
        catch (e) {
            noop();
        }
    }
    callMonitored(function () {
        var stackTrace = computeStackTrace(error);
        stackTrace.stack = stackTrace.stack.slice(internalFramesToSkip);
        formattedStack = toStackTraceString(stackTrace);
    });
    return formattedStack;
}
export function flattenErrorCauses(error, parentSource) {
    var currentError = error;
    var causes = [];
    while ((currentError === null || currentError === void 0 ? void 0 : currentError.cause) instanceof Error && causes.length < 10) {
        var stackTrace = computeStackTrace(currentError.cause);
        causes.push({
            message: currentError.cause.message,
            source: parentSource,
            type: stackTrace === null || stackTrace === void 0 ? void 0 : stackTrace.name,
            stack: stackTrace && toStackTraceString(stackTrace),
        });
        currentError = currentError.cause;
    }
    return causes.length ? causes : undefined;
}
//# sourceMappingURL=error.js.map