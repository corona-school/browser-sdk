import { sendToExtension, createPageExitObservable, willSyntheticsInjectRum, canUseEventBridge, getEventBridge, startTelemetry, startBatchWithReplica, isTelemetryReplicationAllowed, ErrorSource, addTelemetryConfiguration, addTelemetryDebug, } from '@datadog/browser-core';
import { startLogsSessionManager, startLogsSessionManagerStub } from '../domain/logsSessionManager';
import { serializeLogsConfiguration } from '../domain/configuration';
import { startLogsAssembly, getRUMInternalContext } from '../domain/assembly';
import { startConsoleCollection } from '../domain/console/consoleCollection';
import { startReportCollection } from '../domain/report/reportCollection';
import { startNetworkErrorCollection } from '../domain/networkError/networkErrorCollection';
import { startRuntimeErrorCollection } from '../domain/runtimeError/runtimeErrorCollection';
import { LifeCycle } from '../domain/lifeCycle';
import { startLoggerCollection } from '../domain/logger/loggerCollection';
import { startLogsBatch } from '../transport/startLogsBatch';
import { startLogsBridge } from '../transport/startLogsBridge';
import { StatusType } from '../domain/logger';
import { startInternalContext } from '../domain/internalContext';
export function startLogs(initConfiguration, configuration, buildCommonContext, mainLogger) {
    var lifeCycle = new LifeCycle();
    var cleanupTasks = [];
    lifeCycle.subscribe(1 /* LifeCycleEventType.LOG_COLLECTED */, function (log) { return sendToExtension('logs', log); });
    var reportError = function (error) {
        lifeCycle.notify(0 /* LifeCycleEventType.RAW_LOG_COLLECTED */, {
            rawLogsEvent: {
                message: error.message,
                date: error.startClocks.timeStamp,
                error: {
                    origin: ErrorSource.AGENT, // Todo: Remove in the next major release
                },
                origin: ErrorSource.AGENT,
                status: StatusType.error,
            },
        });
        addTelemetryDebug('Error reported to customer', { 'error.message': error.message });
    };
    var pageExitObservable = createPageExitObservable(configuration);
    var session = configuration.sessionStoreStrategyType && !canUseEventBridge() && !willSyntheticsInjectRum()
        ? startLogsSessionManager(configuration)
        : startLogsSessionManagerStub(configuration);
    var _a = startLogsTelemetry(configuration, reportError, pageExitObservable, session.expireObservable), telemetry = _a.telemetry, stopLogsTelemetry = _a.stop;
    cleanupTasks.push(function () { return stopLogsTelemetry(); });
    telemetry.setContextProvider(function () {
        var _a, _b, _c, _d, _e, _f;
        return ({
            application: {
                id: (_a = getRUMInternalContext()) === null || _a === void 0 ? void 0 : _a.application_id,
            },
            session: {
                id: (_b = session.findTrackedSession()) === null || _b === void 0 ? void 0 : _b.id,
            },
            view: {
                id: (_d = (_c = getRUMInternalContext()) === null || _c === void 0 ? void 0 : _c.view) === null || _d === void 0 ? void 0 : _d.id,
            },
            action: {
                id: (_f = (_e = getRUMInternalContext()) === null || _e === void 0 ? void 0 : _e.user_action) === null || _f === void 0 ? void 0 : _f.id,
            },
        });
    });
    startNetworkErrorCollection(configuration, lifeCycle);
    startRuntimeErrorCollection(configuration, lifeCycle);
    startConsoleCollection(configuration, lifeCycle);
    startReportCollection(configuration, lifeCycle);
    var handleLog = startLoggerCollection(lifeCycle).handleLog;
    startLogsAssembly(session, configuration, lifeCycle, buildCommonContext, mainLogger, reportError);
    if (!canUseEventBridge()) {
        var stopLogsBatch_1 = startLogsBatch(configuration, lifeCycle, reportError, pageExitObservable, session.expireObservable).stop;
        cleanupTasks.push(function () { return stopLogsBatch_1(); });
    }
    else {
        startLogsBridge(lifeCycle);
    }
    addTelemetryConfiguration(serializeLogsConfiguration(initConfiguration));
    var internalContext = startInternalContext(session);
    return {
        handleLog: handleLog,
        getInternalContext: internalContext.get,
        stop: function () {
            cleanupTasks.forEach(function (task) { return task(); });
        },
    };
}
function startLogsTelemetry(configuration, reportError, pageExitObservable, sessionExpireObservable) {
    var telemetry = startTelemetry("browser-logs-sdk" /* TelemetryService.LOGS */, configuration);
    var cleanupTasks = [];
    if (canUseEventBridge()) {
        var bridge_1 = getEventBridge();
        var telemetrySubscription_1 = telemetry.observable.subscribe(function (event) { return bridge_1.send('internal_telemetry', event); });
        cleanupTasks.push(function () { return telemetrySubscription_1.unsubscribe(); });
    }
    else {
        var telemetryBatch_1 = startBatchWithReplica(configuration, {
            endpoint: configuration.rumEndpointBuilder,
        }, configuration.replica && {
            endpoint: configuration.replica.rumEndpointBuilder,
        }, reportError, pageExitObservable, sessionExpireObservable);
        cleanupTasks.push(function () { return telemetryBatch_1.stop(); });
        var telemetrySubscription_2 = telemetry.observable.subscribe(function (event) {
            return telemetryBatch_1.add(event, isTelemetryReplicationAllowed(configuration));
        });
        cleanupTasks.push(function () { return telemetrySubscription_2.unsubscribe(); });
    }
    return {
        telemetry: telemetry,
        stop: function () {
            cleanupTasks.forEach(function (task) { return task(); });
        },
    };
}
//# sourceMappingURL=startLogs.js.map