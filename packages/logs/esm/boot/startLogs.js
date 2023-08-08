import { sendToExtension, createPageExitObservable, willSyntheticsInjectRum, canUseEventBridge, getEventBridge, startTelemetry, startBatchWithReplica, isTelemetryReplicationAllowed, ErrorSource, addTelemetryConfiguration, addTelemetryDebug, } from '@datadog/browser-core';
import { startLogsSessionManager, startLogsSessionManagerStub } from '../domain/logsSessionManager';
import { serializeLogsConfiguration } from '../domain/configuration';
import { startLogsAssembly, getRUMInternalContext } from '../domain/assembly';
import { startConsoleCollection } from '../domain/logsCollection/console/consoleCollection';
import { startReportCollection } from '../domain/logsCollection/report/reportCollection';
import { startNetworkErrorCollection } from '../domain/logsCollection/networkError/networkErrorCollection';
import { startRuntimeErrorCollection } from '../domain/logsCollection/runtimeError/runtimeErrorCollection';
import { LifeCycle } from '../domain/lifeCycle';
import { startLoggerCollection } from '../domain/logsCollection/logger/loggerCollection';
import { startLogsBatch } from '../transport/startLogsBatch';
import { startLogsBridge } from '../transport/startLogsBridge';
import { StatusType } from '../domain/logger';
import { startInternalContext } from '../domain/internalContext';
export function startLogs(initConfiguration, configuration, buildCommonContext, mainLogger) {
    var lifeCycle = new LifeCycle();
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
    var pageExitObservable = createPageExitObservable();
    var session = configuration.sessionStoreStrategyType && !canUseEventBridge() && !willSyntheticsInjectRum()
        ? startLogsSessionManager(configuration)
        : startLogsSessionManagerStub(configuration);
    var telemetry = startLogsTelemetry(configuration, reportError, pageExitObservable, session.expireObservable);
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
        startLogsBatch(configuration, lifeCycle, reportError, pageExitObservable, session.expireObservable);
    }
    else {
        startLogsBridge(lifeCycle);
    }
    addTelemetryConfiguration(serializeLogsConfiguration(initConfiguration));
    var internalContext = startInternalContext(session);
    return {
        handleLog: handleLog,
        getInternalContext: internalContext.get,
    };
}
function startLogsTelemetry(configuration, reportError, pageExitObservable, sessionExpireObservable) {
    var _a;
    var telemetry = startTelemetry("browser-logs-sdk" /* TelemetryService.LOGS */, configuration);
    if (canUseEventBridge()) {
        var bridge_1 = getEventBridge();
        telemetry.observable.subscribe(function (event) { return bridge_1.send('internal_telemetry', event); });
    }
    else {
        var telemetryBatch_1 = startBatchWithReplica(configuration, configuration.rumEndpointBuilder, reportError, pageExitObservable, sessionExpireObservable, (_a = configuration.replica) === null || _a === void 0 ? void 0 : _a.rumEndpointBuilder);
        telemetry.observable.subscribe(function (event) { return telemetryBatch_1.add(event, isTelemetryReplicationAllowed(configuration)); });
    }
    return telemetry;
}
//# sourceMappingURL=startLogs.js.map