"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doStartErrorCollection = exports.startErrorCollection = void 0;
var browser_core_1 = require("@datadog/browser-core");
var trackConsoleError_1 = require("./trackConsoleError");
var trackReportError_1 = require("./trackReportError");
function startErrorCollection(lifeCycle, configuration, pageStateHistory, featureFlagContexts) {
    var errorObservable = new browser_core_1.Observable();
    (0, trackConsoleError_1.trackConsoleError)(errorObservable);
    (0, browser_core_1.trackRuntimeError)(errorObservable);
    (0, trackReportError_1.trackReportError)(configuration, errorObservable);
    errorObservable.subscribe(function (error) { return lifeCycle.notify(12 /* LifeCycleEventType.RAW_ERROR_COLLECTED */, { error: error }); });
    return doStartErrorCollection(lifeCycle, pageStateHistory, featureFlagContexts);
}
exports.startErrorCollection = startErrorCollection;
function doStartErrorCollection(lifeCycle, pageStateHistory, featureFlagContexts) {
    lifeCycle.subscribe(12 /* LifeCycleEventType.RAW_ERROR_COLLECTED */, function (_a) {
        var error = _a.error, customerContext = _a.customerContext, savedCommonContext = _a.savedCommonContext;
        lifeCycle.notify(10 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, (0, browser_core_1.assign)({
            customerContext: customerContext,
            savedCommonContext: savedCommonContext,
        }, processError(error, pageStateHistory, featureFlagContexts)));
    });
    return {
        addError: function (_a, savedCommonContext) {
            var error = _a.error, handlingStack = _a.handlingStack, startClocks = _a.startClocks, customerContext = _a.context;
            var stackTrace = error instanceof Error ? (0, browser_core_1.computeStackTrace)(error) : undefined;
            var rawError = (0, browser_core_1.computeRawError)({
                stackTrace: stackTrace,
                originalError: error,
                handlingStack: handlingStack,
                startClocks: startClocks,
                nonErrorPrefix: "Provided" /* NonErrorPrefix.PROVIDED */,
                source: browser_core_1.ErrorSource.CUSTOM,
                handling: "handled" /* ErrorHandling.HANDLED */,
            });
            lifeCycle.notify(12 /* LifeCycleEventType.RAW_ERROR_COLLECTED */, {
                customerContext: customerContext,
                savedCommonContext: savedCommonContext,
                error: rawError,
            });
        },
    };
}
exports.doStartErrorCollection = doStartErrorCollection;
function processError(error, pageStateHistory, featureFlagContexts) {
    var rawRumEvent = {
        date: error.startClocks.timeStamp,
        error: {
            id: (0, browser_core_1.generateUUID)(),
            message: error.message,
            source: error.source,
            stack: error.stack,
            handling_stack: error.handlingStack,
            type: error.type,
            handling: error.handling,
            causes: error.causes,
            source_type: 'browser',
            fingerprint: error.fingerprint,
        },
        type: "error" /* RumEventType.ERROR */,
        view: { in_foreground: pageStateHistory.isInActivePageStateAt(error.startClocks.relative) },
    };
    var featureFlagContext = featureFlagContexts.findFeatureFlagEvaluations(error.startClocks.relative);
    if (featureFlagContext && !(0, browser_core_1.isEmptyObject)(featureFlagContext)) {
        rawRumEvent.feature_flags = featureFlagContext;
    }
    return {
        rawRumEvent: rawRumEvent,
        startTime: error.startClocks.relative,
        domainContext: {
            error: error.originalError,
        },
    };
}
//# sourceMappingURL=errorCollection.js.map