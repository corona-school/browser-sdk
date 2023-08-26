"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRumSessionManagerStub = exports.startRumSessionManager = exports.RUM_SESSION_KEY = void 0;
var browser_core_1 = require("@datadog/browser-core");
exports.RUM_SESSION_KEY = 'rum';
function startRumSessionManager(configuration, lifeCycle) {
    var sessionManager = (0, browser_core_1.startSessionManager)(configuration, exports.RUM_SESSION_KEY, function (rawTrackingType) {
        return computeSessionState(configuration, rawTrackingType);
    });
    sessionManager.expireObservable.subscribe(function () {
        lifeCycle.notify(7 /* LifeCycleEventType.SESSION_EXPIRED */);
    });
    sessionManager.renewObservable.subscribe(function () {
        lifeCycle.notify(8 /* LifeCycleEventType.SESSION_RENEWED */);
    });
    return {
        findTrackedSession: function (startTime) {
            var session = sessionManager.findActiveSession(startTime);
            if (!session || !isTypeTracked(session.trackingType)) {
                return;
            }
            var plan = session.trackingType === "1" /* RumTrackingType.TRACKED_WITH_SESSION_REPLAY */
                ? 2 /* RumSessionPlan.WITH_SESSION_REPLAY */
                : 1 /* RumSessionPlan.WITHOUT_SESSION_REPLAY */;
            return {
                id: session.id,
                plan: plan,
                sessionReplayAllowed: plan === 2 /* RumSessionPlan.WITH_SESSION_REPLAY */,
                longTaskAllowed: configuration.trackLongTasks !== undefined
                    ? configuration.trackLongTasks
                    : configuration.oldPlansBehavior && plan === 2 /* RumSessionPlan.WITH_SESSION_REPLAY */,
                resourceAllowed: configuration.trackResources !== undefined
                    ? configuration.trackResources
                    : configuration.oldPlansBehavior && plan === 2 /* RumSessionPlan.WITH_SESSION_REPLAY */,
            };
        },
        expire: sessionManager.expire,
        expireObservable: sessionManager.expireObservable,
    };
}
exports.startRumSessionManager = startRumSessionManager;
/**
 * Start a tracked replay session stub
 */
function startRumSessionManagerStub() {
    var session = {
        id: '00000000-aaaa-0000-aaaa-000000000000',
        plan: 1 /* RumSessionPlan.WITHOUT_SESSION_REPLAY */,
        sessionReplayAllowed: false,
        longTaskAllowed: true,
        resourceAllowed: true,
    };
    return {
        findTrackedSession: function () { return session; },
        expire: browser_core_1.noop,
        expireObservable: new browser_core_1.Observable(),
    };
}
exports.startRumSessionManagerStub = startRumSessionManagerStub;
function computeSessionState(configuration, rawTrackingType) {
    var trackingType;
    if (hasValidRumSession(rawTrackingType)) {
        trackingType = rawTrackingType;
    }
    else if (!(0, browser_core_1.performDraw)(configuration.sessionSampleRate)) {
        trackingType = "0" /* RumTrackingType.NOT_TRACKED */;
    }
    else if (!(0, browser_core_1.performDraw)(configuration.sessionReplaySampleRate)) {
        trackingType = "2" /* RumTrackingType.TRACKED_WITHOUT_SESSION_REPLAY */;
    }
    else {
        trackingType = "1" /* RumTrackingType.TRACKED_WITH_SESSION_REPLAY */;
    }
    return {
        trackingType: trackingType,
        isTracked: isTypeTracked(trackingType),
    };
}
function hasValidRumSession(trackingType) {
    return (trackingType === "0" /* RumTrackingType.NOT_TRACKED */ ||
        trackingType === "1" /* RumTrackingType.TRACKED_WITH_SESSION_REPLAY */ ||
        trackingType === "2" /* RumTrackingType.TRACKED_WITHOUT_SESSION_REPLAY */);
}
function isTypeTracked(rumSessionType) {
    return (rumSessionType === "2" /* RumTrackingType.TRACKED_WITHOUT_SESSION_REPLAY */ ||
        rumSessionType === "1" /* RumTrackingType.TRACKED_WITH_SESSION_REPLAY */);
}
//# sourceMappingURL=rumSessionManager.js.map