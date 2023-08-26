import { Observable, noop, performDraw, startSessionManager } from '@datadog/browser-core';
export var RUM_SESSION_KEY = 'rum';
export function startRumSessionManager(configuration, lifeCycle) {
    var sessionManager = startSessionManager(configuration, RUM_SESSION_KEY, function (rawTrackingType) {
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
/**
 * Start a tracked replay session stub
 */
export function startRumSessionManagerStub() {
    var session = {
        id: '00000000-aaaa-0000-aaaa-000000000000',
        plan: 1 /* RumSessionPlan.WITHOUT_SESSION_REPLAY */,
        sessionReplayAllowed: false,
        longTaskAllowed: true,
        resourceAllowed: true,
    };
    return {
        findTrackedSession: function () { return session; },
        expire: noop,
        expireObservable: new Observable(),
    };
}
function computeSessionState(configuration, rawTrackingType) {
    var trackingType;
    if (hasValidRumSession(rawTrackingType)) {
        trackingType = rawTrackingType;
    }
    else if (!performDraw(configuration.sessionSampleRate)) {
        trackingType = "0" /* RumTrackingType.NOT_TRACKED */;
    }
    else if (!performDraw(configuration.sessionReplaySampleRate)) {
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