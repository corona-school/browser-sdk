"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startFeatureFlagContexts = exports.BYTES_COMPUTATION_THROTTLING_DELAY = exports.FEATURE_FLAG_CONTEXT_TIME_OUT_DELAY = void 0;
var browser_core_1 = require("@datadog/browser-core");
exports.FEATURE_FLAG_CONTEXT_TIME_OUT_DELAY = browser_core_1.SESSION_TIME_OUT_DELAY;
exports.BYTES_COMPUTATION_THROTTLING_DELAY = 200;
/**
 * Start feature flag contexts
 *
 * Feature flag contexts follow the life of views.
 * A new context is added when a view is created and ended when the view is ended
 *
 * Note: we choose not to add a new context at each evaluation to save memory
 */
function startFeatureFlagContexts(lifeCycle, computeBytesCountImpl) {
    if (computeBytesCountImpl === void 0) { computeBytesCountImpl = browser_core_1.computeBytesCount; }
    if (!(0, browser_core_1.isExperimentalFeatureEnabled)(browser_core_1.ExperimentalFeature.FEATURE_FLAGS)) {
        return {
            findFeatureFlagEvaluations: function () { return undefined; },
            getFeatureFlagBytesCount: function () { return 0; },
            addFeatureFlagEvaluation: browser_core_1.noop,
            stop: browser_core_1.noop,
        };
    }
    var featureFlagContexts = new browser_core_1.ValueHistory(exports.FEATURE_FLAG_CONTEXT_TIME_OUT_DELAY);
    var bytesCountCache = 0;
    var alreadyWarned = false;
    lifeCycle.subscribe(4 /* LifeCycleEventType.VIEW_ENDED */, function (_a) {
        var endClocks = _a.endClocks;
        featureFlagContexts.closeActive(endClocks.relative);
    });
    lifeCycle.subscribe(2 /* LifeCycleEventType.VIEW_CREATED */, function (_a) {
        var startClocks = _a.startClocks;
        featureFlagContexts.add({}, startClocks.relative);
        bytesCountCache = 0;
    });
    // Throttle the bytes computation to minimize the impact on performance.
    // Especially useful if the user call addFeatureFlagEvaluation API synchronously multiple times in a row
    var _a = (0, browser_core_1.throttle)(function (context) {
        bytesCountCache = computeBytesCountImpl((0, browser_core_1.jsonStringify)(context));
        if (!alreadyWarned) {
            alreadyWarned = (0, browser_core_1.warnIfCustomerDataLimitReached)(bytesCountCache, 0 /* CustomerDataType.FeatureFlag */);
        }
    }, exports.BYTES_COMPUTATION_THROTTLING_DELAY), computeBytesCountThrottled = _a.throttled, cancelPendingComputation = _a.cancel;
    return {
        findFeatureFlagEvaluations: function (startTime) { return featureFlagContexts.find(startTime); },
        getFeatureFlagBytesCount: function () {
            var currentContext = featureFlagContexts.find();
            if (!currentContext) {
                return 0;
            }
            return bytesCountCache;
        },
        addFeatureFlagEvaluation: function (key, value) {
            var currentContext = featureFlagContexts.find();
            if (currentContext) {
                currentContext[key] = value;
                computeBytesCountThrottled(currentContext);
            }
        },
        stop: cancelPendingComputation,
    };
}
exports.startFeatureFlagContexts = startFeatureFlagContexts;
//# sourceMappingURL=featureFlagContext.js.map