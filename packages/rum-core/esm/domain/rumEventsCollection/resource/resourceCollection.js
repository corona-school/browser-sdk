import { combine, generateUUID, toServerDuration, relativeToClocks, assign, isNumber, isExperimentalFeatureEnabled, ExperimentalFeature, } from '@datadog/browser-core';
import { matchRequestTiming } from './matchRequestTiming';
import { computePerformanceResourceDetails, computePerformanceResourceDuration, computeResourceKind, computeSize, isRequestKind, } from './resourceUtils';
export function startResourceCollection(lifeCycle, configuration, sessionManager, pageStateHistory) {
    lifeCycle.subscribe(6 /* LifeCycleEventType.REQUEST_COMPLETED */, function (request) {
        lifeCycle.notify(10 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, processRequest(request, configuration, sessionManager, pageStateHistory));
    });
    lifeCycle.subscribe(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            if (entry.entryType === 'resource' && !isRequestKind(entry)) {
                lifeCycle.notify(10 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, processResourceEntry(entry, configuration, sessionManager, pageStateHistory));
            }
        }
    });
}
function processRequest(request, configuration, sessionManager, pageStateHistory) {
    var _a;
    var type = request.type === "xhr" /* RequestType.XHR */ ? "xhr" /* ResourceType.XHR */ : "fetch" /* ResourceType.FETCH */;
    var matchingTiming = matchRequestTiming(request);
    var startClocks = matchingTiming ? relativeToClocks(matchingTiming.startTime) : request.startClocks;
    var correspondingTimingOverrides = matchingTiming ? computePerformanceEntryMetrics(matchingTiming) : undefined;
    var tracingInfo = computeRequestTracingInfo(request, configuration);
    var indexingInfo = computeIndexingInfo(sessionManager, startClocks);
    var duration = computeRequestDuration(pageStateHistory, startClocks, request.duration);
    var pageStateInfo = computePageStateInfo(pageStateHistory, startClocks, (_a = matchingTiming === null || matchingTiming === void 0 ? void 0 : matchingTiming.duration) !== null && _a !== void 0 ? _a : request.duration);
    var resourceEvent = combine({
        date: startClocks.timeStamp,
        resource: {
            id: generateUUID(),
            type: type,
            duration: duration,
            method: request.method,
            status_code: request.status,
            url: request.url,
        },
        type: "resource" /* RumEventType.RESOURCE */,
    }, tracingInfo, correspondingTimingOverrides, indexingInfo, pageStateInfo);
    return {
        startTime: startClocks.relative,
        rawRumEvent: resourceEvent,
        domainContext: {
            performanceEntry: matchingTiming && toPerformanceEntryRepresentation(matchingTiming),
            xhr: request.xhr,
            response: request.response,
            requestInput: request.input,
            requestInit: request.init,
            error: request.error,
        },
    };
}
function processResourceEntry(entry, configuration, sessionManager, pageStateHistory) {
    var type = computeResourceKind(entry);
    var entryMetrics = computePerformanceEntryMetrics(entry);
    var startClocks = relativeToClocks(entry.startTime);
    var tracingInfo = computeEntryTracingInfo(entry, configuration);
    var indexingInfo = computeIndexingInfo(sessionManager, startClocks);
    var pageStateInfo = computePageStateInfo(pageStateHistory, startClocks, entry.duration);
    var resourceEvent = combine({
        date: startClocks.timeStamp,
        resource: {
            id: generateUUID(),
            type: type,
            url: entry.name,
        },
        type: "resource" /* RumEventType.RESOURCE */,
    }, tracingInfo, entryMetrics, indexingInfo, pageStateInfo);
    return {
        startTime: startClocks.relative,
        rawRumEvent: resourceEvent,
        domainContext: {
            performanceEntry: toPerformanceEntryRepresentation(entry),
        },
    };
}
function computePerformanceEntryMetrics(timing) {
    return {
        resource: assign({
            duration: computePerformanceResourceDuration(timing),
            size: computeSize(timing),
        }, computePerformanceResourceDetails(timing)),
    };
}
function computeRequestTracingInfo(request, configuration) {
    var hasBeenTraced = request.traceSampled && request.traceId && request.spanId;
    if (!hasBeenTraced) {
        return undefined;
    }
    return {
        _dd: {
            span_id: request.spanId.toDecimalString(),
            trace_id: request.traceId.toDecimalString(),
            rule_psr: getRulePsr(configuration),
        },
    };
}
function computeEntryTracingInfo(entry, configuration) {
    var hasBeenTraced = entry.traceId;
    if (!hasBeenTraced) {
        return undefined;
    }
    return {
        _dd: {
            trace_id: entry.traceId,
            rule_psr: getRulePsr(configuration),
        },
    };
}
// TODO next major: use directly PerformanceEntry type in domain context
function toPerformanceEntryRepresentation(entry) {
    return entry;
}
/**
 * @returns number between 0 and 1 which represents trace sample rate
 */
function getRulePsr(configuration) {
    return isNumber(configuration.traceSampleRate) ? configuration.traceSampleRate / 100 : undefined;
}
function computeIndexingInfo(sessionManager, resourceStart) {
    var session = sessionManager.findTrackedSession(resourceStart.relative);
    return {
        _dd: {
            discarded: !session || !session.resourceAllowed,
        },
    };
}
function computePageStateInfo(pageStateHistory, startClocks, duration) {
    if (!isExperimentalFeatureEnabled(ExperimentalFeature.RESOURCE_PAGE_STATES)) {
        return;
    }
    return {
        _dd: {
            page_states: pageStateHistory.findAll(startClocks.relative, duration),
            page_was_discarded: String(document.wasDiscarded),
        },
    };
}
function computeRequestDuration(pageStateHistory, startClocks, duration) {
    var _a;
    // TODO remove FF in next major
    if (!isExperimentalFeatureEnabled(ExperimentalFeature.NO_RESOURCE_DURATION_FROZEN_STATE)) {
        return toServerDuration(duration);
    }
    var requestCrossedFrozenState = (_a = pageStateHistory
        .findAll(startClocks.relative, duration)) === null || _a === void 0 ? void 0 : _a.some(function (pageState) { return pageState.state === "frozen" /* PageState.FROZEN */; });
    return !requestCrossedFrozenState ? toServerDuration(duration) : undefined;
}
//# sourceMappingURL=resourceCollection.js.map