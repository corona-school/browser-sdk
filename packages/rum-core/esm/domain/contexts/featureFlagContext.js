import { warnIfCustomerDataLimitReached, throttle, jsonStringify, computeBytesCount, noop, isExperimentalFeatureEnabled, SESSION_TIME_OUT_DELAY, ValueHistory, ExperimentalFeature, } from '@datadog/browser-core';
export var FEATURE_FLAG_CONTEXT_TIME_OUT_DELAY = SESSION_TIME_OUT_DELAY;
export var BYTES_COMPUTATION_THROTTLING_DELAY = 200;
/**
 * Start feature flag contexts
 *
 * Feature flag contexts follow the life of views.
 * A new context is added when a view is created and ended when the view is ended
 *
 * Note: we choose not to add a new context at each evaluation to save memory
 */
export function startFeatureFlagContexts(lifeCycle, computeBytesCountImpl) {
    if (computeBytesCountImpl === void 0) { computeBytesCountImpl = computeBytesCount; }
    if (!isExperimentalFeatureEnabled(ExperimentalFeature.FEATURE_FLAGS)) {
        return {
            findFeatureFlagEvaluations: function () { return undefined; },
            getFeatureFlagBytesCount: function () { return 0; },
            addFeatureFlagEvaluation: noop,
            stop: noop,
        };
    }
    var featureFlagContexts = new ValueHistory(FEATURE_FLAG_CONTEXT_TIME_OUT_DELAY);
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
    var _a = throttle(function (context) {
        bytesCountCache = computeBytesCountImpl(jsonStringify(context));
        if (!alreadyWarned) {
            alreadyWarned = warnIfCustomerDataLimitReached(bytesCountCache, 0 /* CustomerDataType.FeatureFlag */);
        }
    }, BYTES_COMPUTATION_THROTTLING_DELAY), computeBytesCountThrottled = _a.throttled, cancelPendingComputation = _a.cancel;
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
//# sourceMappingURL=featureFlagContext.js.map