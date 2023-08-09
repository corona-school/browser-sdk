import { combine, isEmptyObject, timeStampNow, currentDrift, display, createEventRateLimiter, canUseEventBridge, assign, round, } from '@datadog/browser-core';
import { getSyntheticsContext } from './contexts/syntheticsContext';
import { getCiTestContext } from './contexts/ciTestContext';
import { getDisplayContext } from './contexts/displayContext';
import { limitModification } from './limitModification';
var VIEW_MODIFIABLE_FIELD_PATHS = {
    'view.url': 'string',
    'view.referrer': 'string',
};
var USER_CUSTOMIZABLE_FIELD_PATHS = {
    context: 'object',
};
var modifiableFieldPathsByEvent;
export function startRumAssembly(configuration, lifeCycle, sessionManager, viewContexts, urlContexts, actionContexts, buildCommonContext, reportError) {
    var _a, _b;
    modifiableFieldPathsByEvent = (_a = {},
        _a["view" /* RumEventType.VIEW */] = VIEW_MODIFIABLE_FIELD_PATHS,
        _a["error" /* RumEventType.ERROR */] = assign({
            'error.message': 'string',
            'error.stack': 'string',
            'error.resource.url': 'string',
            'error.fingerprint': 'string',
        }, USER_CUSTOMIZABLE_FIELD_PATHS, VIEW_MODIFIABLE_FIELD_PATHS),
        _a["resource" /* RumEventType.RESOURCE */] = assign({
            'resource.url': 'string',
        }, USER_CUSTOMIZABLE_FIELD_PATHS, VIEW_MODIFIABLE_FIELD_PATHS),
        _a["action" /* RumEventType.ACTION */] = assign({
            'action.target.name': 'string',
        }, USER_CUSTOMIZABLE_FIELD_PATHS, VIEW_MODIFIABLE_FIELD_PATHS),
        _a["long_task" /* RumEventType.LONG_TASK */] = assign({}, USER_CUSTOMIZABLE_FIELD_PATHS, VIEW_MODIFIABLE_FIELD_PATHS),
        _a);
    var eventRateLimiters = (_b = {},
        _b["error" /* RumEventType.ERROR */] = createEventRateLimiter("error" /* RumEventType.ERROR */, configuration.eventRateLimiterThreshold, reportError),
        _b["action" /* RumEventType.ACTION */] = createEventRateLimiter("action" /* RumEventType.ACTION */, configuration.eventRateLimiterThreshold, reportError),
        _b);
    var syntheticsContext = getSyntheticsContext();
    var ciTestContext = getCiTestContext();
    lifeCycle.subscribe(10 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, function (_a) {
        var startTime = _a.startTime, rawRumEvent = _a.rawRumEvent, domainContext = _a.domainContext, savedCommonContext = _a.savedCommonContext, customerContext = _a.customerContext;
        var viewContext = viewContexts.findView(startTime);
        var urlContext = urlContexts.findUrl(startTime);
        var session = sessionManager.findTrackedSession(startTime);
        if (session && viewContext && urlContext) {
            var commonContext = savedCommonContext || buildCommonContext();
            var actionId = actionContexts.findActionId(startTime);
            var rumContext = {
                _dd: {
                    format_version: 2,
                    drift: currentDrift(),
                    session: {
                        plan: session.plan,
                    },
                    configuration: {
                        session_sample_rate: round(configuration.sessionSampleRate, 3),
                        session_replay_sample_rate: round(configuration.sessionReplaySampleRate, 3),
                    },
                    browser_sdk_version: canUseEventBridge() ? "4.45.0" : undefined,
                },
                application: {
                    id: configuration.applicationId,
                },
                date: timeStampNow(),
                service: viewContext.service || configuration.service,
                version: viewContext.version || configuration.version,
                source: 'browser',
                session: {
                    id: session.id,
                    type: syntheticsContext ? "synthetics" /* SessionType.SYNTHETICS */ : ciTestContext ? "ci_test" /* SessionType.CI_TEST */ : "user" /* SessionType.USER */,
                },
                view: {
                    id: viewContext.id,
                    name: viewContext.name,
                    url: urlContext.url,
                    referrer: urlContext.referrer,
                },
                action: needToAssembleWithAction(rawRumEvent) && actionId ? { id: actionId } : undefined,
                synthetics: syntheticsContext,
                ci_test: ciTestContext,
                display: getDisplayContext(),
            };
            var serverRumEvent = combine(rumContext, rawRumEvent);
            serverRumEvent.context = combine(commonContext.context, customerContext);
            if (!('has_replay' in serverRumEvent.session)) {
                ;
                serverRumEvent.session.has_replay = commonContext.hasReplay;
            }
            if (!isEmptyObject(commonContext.user)) {
                ;
                serverRumEvent.usr = commonContext.user;
            }
            if (shouldSend(serverRumEvent, configuration.beforeSend, domainContext, eventRateLimiters)) {
                if (isEmptyObject(serverRumEvent.context)) {
                    delete serverRumEvent.context;
                }
                lifeCycle.notify(11 /* LifeCycleEventType.RUM_EVENT_COLLECTED */, serverRumEvent);
            }
        }
    });
}
function shouldSend(event, beforeSend, domainContext, eventRateLimiters) {
    var _a;
    if (beforeSend) {
        var result = limitModification(event, modifiableFieldPathsByEvent[event.type], function (event) {
            return beforeSend(event, domainContext);
        });
        if (result === false && event.type !== "view" /* RumEventType.VIEW */) {
            return false;
        }
        if (result === false) {
            display.warn("Can't dismiss view events using beforeSend!");
        }
    }
    var rateLimitReached = (_a = eventRateLimiters[event.type]) === null || _a === void 0 ? void 0 : _a.isLimitReached();
    return !rateLimitReached;
}
function needToAssembleWithAction(event) {
    return ["error" /* RumEventType.ERROR */, "resource" /* RumEventType.RESOURCE */, "long_task" /* RumEventType.LONG_TASK */].indexOf(event.type) !== -1;
}
//# sourceMappingURL=assembly.js.map