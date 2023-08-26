"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startViewCollection = void 0;
var browser_core_1 = require("@datadog/browser-core");
var foregroundContexts_1 = require("../../contexts/foregroundContexts");
var trackViews_1 = require("./trackViews");
function startViewCollection(lifeCycle, configuration, location, domMutationObservable, locationChangeObservable, featureFlagContexts, pageStateHistory, recorderApi, webVitalTelemetryDebug, initialViewOptions) {
    lifeCycle.subscribe(3 /* LifeCycleEventType.VIEW_UPDATED */, function (view) {
        return lifeCycle.notify(10 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, processViewUpdate(view, configuration, featureFlagContexts, recorderApi, pageStateHistory));
    });
    var trackViewResult = (0, trackViews_1.trackViews)(location, lifeCycle, domMutationObservable, configuration, locationChangeObservable, !configuration.trackViewsManually, webVitalTelemetryDebug, initialViewOptions);
    return trackViewResult;
}
exports.startViewCollection = startViewCollection;
function processViewUpdate(view, configuration, featureFlagContexts, recorderApi, pageStateHistory) {
    var replayStats = recorderApi.getReplayStats(view.id);
    var featureFlagContext = featureFlagContexts.findFeatureFlagEvaluations(view.startClocks.relative);
    var pageStatesEnabled = (0, browser_core_1.isExperimentalFeatureEnabled)(browser_core_1.ExperimentalFeature.PAGE_STATES);
    var pageStates = pageStateHistory.findAll(view.startClocks.relative, view.duration);
    var viewEvent = {
        _dd: {
            document_version: view.documentVersion,
            replay_stats: replayStats,
            page_states: pageStatesEnabled ? pageStates : undefined,
        },
        date: view.startClocks.timeStamp,
        type: "view" /* RumEventType.VIEW */,
        view: {
            action: {
                count: view.eventCounts.actionCount,
            },
            frustration: {
                count: view.eventCounts.frustrationCount,
            },
            cumulative_layout_shift: view.cumulativeLayoutShift,
            first_byte: (0, browser_core_1.toServerDuration)(view.timings.firstByte),
            dom_complete: (0, browser_core_1.toServerDuration)(view.timings.domComplete),
            dom_content_loaded: (0, browser_core_1.toServerDuration)(view.timings.domContentLoaded),
            dom_interactive: (0, browser_core_1.toServerDuration)(view.timings.domInteractive),
            error: {
                count: view.eventCounts.errorCount,
            },
            first_contentful_paint: (0, browser_core_1.toServerDuration)(view.timings.firstContentfulPaint),
            first_input_delay: (0, browser_core_1.toServerDuration)(view.timings.firstInputDelay),
            first_input_time: (0, browser_core_1.toServerDuration)(view.timings.firstInputTime),
            is_active: view.isActive,
            name: view.name,
            largest_contentful_paint: (0, browser_core_1.toServerDuration)(view.timings.largestContentfulPaint),
            load_event: (0, browser_core_1.toServerDuration)(view.timings.loadEvent),
            loading_time: discardNegativeDuration((0, browser_core_1.toServerDuration)(view.loadingTime)),
            loading_type: view.loadingType,
            long_task: {
                count: view.eventCounts.longTaskCount,
            },
            resource: {
                count: view.eventCounts.resourceCount,
            },
            time_spent: (0, browser_core_1.toServerDuration)(view.duration),
            in_foreground_periods: !pageStatesEnabled && pageStates ? (0, foregroundContexts_1.mapToForegroundPeriods)(pageStates, view.duration) : undefined, // Todo: Remove in the next major release
        },
        feature_flags: featureFlagContext && !(0, browser_core_1.isEmptyObject)(featureFlagContext) ? featureFlagContext : undefined,
        display: view.scrollMetrics
            ? {
                scroll: {
                    max_depth: view.scrollMetrics.maxDepth,
                    max_depth_scroll_height: view.scrollMetrics.maxDepthScrollHeight,
                    max_depth_scroll_top: view.scrollMetrics.maxDepthScrollTop,
                    max_depth_time: (0, browser_core_1.toServerDuration)(view.scrollMetrics.maxDepthTime),
                },
            }
            : undefined,
        session: {
            has_replay: replayStats ? true : undefined,
            is_active: view.sessionIsActive ? undefined : false,
        },
        privacy: {
            replay_level: configuration.defaultPrivacyLevel,
        },
    };
    if (!(0, browser_core_1.isEmptyObject)(view.customTimings)) {
        viewEvent.view.custom_timings = (0, browser_core_1.mapValues)(view.customTimings, browser_core_1.toServerDuration);
    }
    return {
        rawRumEvent: viewEvent,
        startTime: view.startClocks.relative,
        domainContext: {
            location: view.location,
        },
    };
}
function discardNegativeDuration(duration) {
    return (0, browser_core_1.isNumber)(duration) && duration < 0 ? undefined : duration;
}
//# sourceMappingURL=viewCollection.js.map