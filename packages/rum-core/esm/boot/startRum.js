import { sendToExtension, createPageExitObservable, addTelemetryConfiguration, startTelemetry, canUseEventBridge, getEventBridge, addTelemetryDebug, } from '@datadog/browser-core';
import { createDOMMutationObservable } from '../browser/domMutationObservable';
import { startPerformanceCollection } from '../browser/performanceCollection';
import { startRumAssembly } from '../domain/assembly';
import { startInternalContext } from '../domain/contexts/internalContext';
import { LifeCycle } from '../domain/lifeCycle';
import { startViewContexts } from '../domain/contexts/viewContexts';
import { startRequestCollection } from '../domain/requestCollection';
import { startActionCollection } from '../domain/action/actionCollection';
import { startErrorCollection } from '../domain/error/errorCollection';
import { startLongTaskCollection } from '../domain/longTask/longTaskCollection';
import { startResourceCollection } from '../domain/resource/resourceCollection';
import { startViewCollection } from '../domain/view/viewCollection';
import { startRumSessionManager, startRumSessionManagerStub } from '../domain/rumSessionManager';
import { startRumBatch } from '../transport/startRumBatch';
import { startRumEventBridge } from '../transport/startRumEventBridge';
import { startUrlContexts } from '../domain/contexts/urlContexts';
import { createLocationChangeObservable } from '../browser/locationChangeObservable';
import { serializeRumConfiguration } from '../domain/configuration';
import { startFeatureFlagContexts } from '../domain/contexts/featureFlagContext';
import { startCustomerDataTelemetry } from '../domain/startCustomerDataTelemetry';
import { startPageStateHistory } from '../domain/contexts/pageStateHistory';
import { buildCommonContext } from '../domain/contexts/commonContext';
import { startWebVitalTelemetryDebug } from '../domain/view/startWebVitalTelemetryDebug';
import { startDisplayContext } from '../domain/contexts/displayContext';
export function startRum(initConfiguration, configuration, recorderApi, globalContextManager, userContextManager, initialViewOptions) {
    var cleanupTasks = [];
    var lifeCycle = new LifeCycle();
    lifeCycle.subscribe(11 /* LifeCycleEventType.RUM_EVENT_COLLECTED */, function (event) { return sendToExtension('rum', event); });
    var telemetry = startRumTelemetry(configuration);
    telemetry.setContextProvider(function () {
        var _a, _b;
        return ({
            application: {
                id: configuration.applicationId,
            },
            session: {
                id: (_a = session.findTrackedSession()) === null || _a === void 0 ? void 0 : _a.id,
            },
            view: {
                id: (_b = viewContexts.findView()) === null || _b === void 0 ? void 0 : _b.id,
            },
            action: {
                id: actionContexts.findActionId(),
            },
        });
    });
    var reportError = function (error) {
        lifeCycle.notify(12 /* LifeCycleEventType.RAW_ERROR_COLLECTED */, { error: error });
        addTelemetryDebug('Error reported to customer', { 'error.message': error.message });
    };
    var featureFlagContexts = startFeatureFlagContexts(lifeCycle);
    var pageExitObservable = createPageExitObservable(configuration);
    var pageExitSubscription = pageExitObservable.subscribe(function (event) {
        lifeCycle.notify(9 /* LifeCycleEventType.PAGE_EXITED */, event);
    });
    cleanupTasks.push(function () { return pageExitSubscription.unsubscribe(); });
    var session = !canUseEventBridge() ? startRumSessionManager(configuration, lifeCycle) : startRumSessionManagerStub();
    if (!canUseEventBridge()) {
        var batch_1 = startRumBatch(configuration, lifeCycle, telemetry.observable, reportError, pageExitObservable, session.expireObservable);
        cleanupTasks.push(function () { return batch_1.stop(); });
        startCustomerDataTelemetry(configuration, telemetry, lifeCycle, globalContextManager, userContextManager, featureFlagContexts, batch_1.flushObservable);
    }
    else {
        startRumEventBridge(lifeCycle);
    }
    var domMutationObservable = createDOMMutationObservable();
    var locationChangeObservable = createLocationChangeObservable(configuration, location);
    var _a = startRumEventCollection(lifeCycle, configuration, location, session, locationChangeObservable, domMutationObservable, function () { return buildCommonContext(globalContextManager, userContextManager, recorderApi); }, reportError), viewContexts = _a.viewContexts, pageStateHistory = _a.pageStateHistory, urlContexts = _a.urlContexts, actionContexts = _a.actionContexts, addAction = _a.addAction, stopRumEventCollection = _a.stop;
    cleanupTasks.push(stopRumEventCollection);
    addTelemetryConfiguration(serializeRumConfiguration(initConfiguration));
    startLongTaskCollection(lifeCycle, session);
    startResourceCollection(lifeCycle, configuration, session, pageStateHistory);
    var webVitalTelemetryDebug = startWebVitalTelemetryDebug(configuration, telemetry, recorderApi, session);
    var _b = startViewCollection(lifeCycle, configuration, location, domMutationObservable, locationChangeObservable, featureFlagContexts, pageStateHistory, recorderApi, webVitalTelemetryDebug, initialViewOptions), addTiming = _b.addTiming, startView = _b.startView, stopViewCollection = _b.stop;
    cleanupTasks.push(stopViewCollection);
    var addError = startErrorCollection(lifeCycle, configuration, pageStateHistory, featureFlagContexts).addError;
    startRequestCollection(lifeCycle, configuration, session);
    startPerformanceCollection(lifeCycle, configuration);
    var internalContext = startInternalContext(configuration.applicationId, session, viewContexts, actionContexts, urlContexts);
    return {
        addAction: addAction,
        addError: addError,
        addTiming: addTiming,
        addFeatureFlagEvaluation: featureFlagContexts.addFeatureFlagEvaluation,
        startView: startView,
        lifeCycle: lifeCycle,
        viewContexts: viewContexts,
        session: session,
        stopSession: function () { return session.expire(); },
        getInternalContext: internalContext.get,
        stop: function () {
            cleanupTasks.forEach(function (task) { return task(); });
        },
    };
}
function startRumTelemetry(configuration) {
    var telemetry = startTelemetry("browser-rum-sdk" /* TelemetryService.RUM */, configuration);
    if (canUseEventBridge()) {
        var bridge_1 = getEventBridge();
        telemetry.observable.subscribe(function (event) { return bridge_1.send('internal_telemetry', event); });
    }
    return telemetry;
}
export function startRumEventCollection(lifeCycle, configuration, location, sessionManager, locationChangeObservable, domMutationObservable, buildCommonContext, reportError) {
    var viewContexts = startViewContexts(lifeCycle);
    var urlContexts = startUrlContexts(lifeCycle, locationChangeObservable, location);
    var pageStateHistory = startPageStateHistory(configuration);
    var _a = startActionCollection(lifeCycle, domMutationObservable, configuration, pageStateHistory), addAction = _a.addAction, actionContexts = _a.actionContexts;
    var displayContext = startDisplayContext(configuration);
    startRumAssembly(configuration, lifeCycle, sessionManager, viewContexts, urlContexts, actionContexts, displayContext, buildCommonContext, reportError);
    return {
        viewContexts: viewContexts,
        pageStateHistory: pageStateHistory,
        urlContexts: urlContexts,
        addAction: addAction,
        actionContexts: actionContexts,
        stop: function () {
            displayContext.stop();
            pageStateHistory.stop();
            urlContexts.stop();
            viewContexts.stop();
            pageStateHistory.stop();
        },
    };
}
//# sourceMappingURL=startRum.js.map