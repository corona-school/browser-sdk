"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startLogs = void 0;
var browser_core_1 = require("@datadog/browser-core");
var logsSessionManager_1 = require("../domain/logsSessionManager");
var configuration_1 = require("../domain/configuration");
var assembly_1 = require("../domain/assembly");
var consoleCollection_1 = require("../domain/console/consoleCollection");
var reportCollection_1 = require("../domain/report/reportCollection");
var networkErrorCollection_1 = require("../domain/networkError/networkErrorCollection");
var runtimeErrorCollection_1 = require("../domain/runtimeError/runtimeErrorCollection");
var lifeCycle_1 = require("../domain/lifeCycle");
var loggerCollection_1 = require("../domain/logger/loggerCollection");
var startLogsBatch_1 = require("../transport/startLogsBatch");
var startLogsBridge_1 = require("../transport/startLogsBridge");
var logger_1 = require("../domain/logger");
var internalContext_1 = require("../domain/internalContext");
function startLogs(initConfiguration, configuration, buildCommonContext, mainLogger) {
    var lifeCycle = new lifeCycle_1.LifeCycle();
    var cleanupTasks = [];
    lifeCycle.subscribe(1 /* LifeCycleEventType.LOG_COLLECTED */, function (log) { return (0, browser_core_1.sendToExtension)('logs', log); });
    var reportError = function (error) {
        lifeCycle.notify(0 /* LifeCycleEventType.RAW_LOG_COLLECTED */, {
            rawLogsEvent: {
                message: error.message,
                date: error.startClocks.timeStamp,
                error: {
                    origin: browser_core_1.ErrorSource.AGENT, // Todo: Remove in the next major release
                },
                origin: browser_core_1.ErrorSource.AGENT,
                status: logger_1.StatusType.error,
            },
        });
        (0, browser_core_1.addTelemetryDebug)('Error reported to customer', { 'error.message': error.message });
    };
    var pageExitObservable = (0, browser_core_1.createPageExitObservable)(configuration);
    var session = configuration.sessionStoreStrategyType && !(0, browser_core_1.canUseEventBridge)() && !(0, browser_core_1.willSyntheticsInjectRum)()
        ? (0, logsSessionManager_1.startLogsSessionManager)(configuration)
        : (0, logsSessionManager_1.startLogsSessionManagerStub)(configuration);
    var _a = startLogsTelemetry(configuration, reportError, pageExitObservable, session.expireObservable), telemetry = _a.telemetry, stopLogsTelemetry = _a.stop;
    cleanupTasks.push(function () { return stopLogsTelemetry(); });
    telemetry.setContextProvider(function () {
        var _a, _b, _c, _d, _e, _f;
        return ({
            application: {
                id: (_a = (0, assembly_1.getRUMInternalContext)()) === null || _a === void 0 ? void 0 : _a.application_id,
            },
            session: {
                id: (_b = session.findTrackedSession()) === null || _b === void 0 ? void 0 : _b.id,
            },
            view: {
                id: (_d = (_c = (0, assembly_1.getRUMInternalContext)()) === null || _c === void 0 ? void 0 : _c.view) === null || _d === void 0 ? void 0 : _d.id,
            },
            action: {
                id: (_f = (_e = (0, assembly_1.getRUMInternalContext)()) === null || _e === void 0 ? void 0 : _e.user_action) === null || _f === void 0 ? void 0 : _f.id,
            },
        });
    });
    (0, networkErrorCollection_1.startNetworkErrorCollection)(configuration, lifeCycle);
    (0, runtimeErrorCollection_1.startRuntimeErrorCollection)(configuration, lifeCycle);
    (0, consoleCollection_1.startConsoleCollection)(configuration, lifeCycle);
    (0, reportCollection_1.startReportCollection)(configuration, lifeCycle);
    var handleLog = (0, loggerCollection_1.startLoggerCollection)(lifeCycle).handleLog;
    (0, assembly_1.startLogsAssembly)(session, configuration, lifeCycle, buildCommonContext, mainLogger, reportError);
    if (!(0, browser_core_1.canUseEventBridge)()) {
        var stopLogsBatch_1 = (0, startLogsBatch_1.startLogsBatch)(configuration, lifeCycle, reportError, pageExitObservable, session.expireObservable).stop;
        cleanupTasks.push(function () { return stopLogsBatch_1(); });
    }
    else {
        (0, startLogsBridge_1.startLogsBridge)(lifeCycle);
    }
    (0, browser_core_1.addTelemetryConfiguration)((0, configuration_1.serializeLogsConfiguration)(initConfiguration));
    var internalContext = (0, internalContext_1.startInternalContext)(session);
    return {
        handleLog: handleLog,
        getInternalContext: internalContext.get,
        stop: function () {
            cleanupTasks.forEach(function (task) { return task(); });
        },
    };
}
exports.startLogs = startLogs;
function startLogsTelemetry(configuration, reportError, pageExitObservable, sessionExpireObservable) {
    var telemetry = (0, browser_core_1.startTelemetry)("browser-logs-sdk" /* TelemetryService.LOGS */, configuration);
    var cleanupTasks = [];
    if ((0, browser_core_1.canUseEventBridge)()) {
        var bridge_1 = (0, browser_core_1.getEventBridge)();
        var telemetrySubscription_1 = telemetry.observable.subscribe(function (event) { return bridge_1.send('internal_telemetry', event); });
        cleanupTasks.push(function () { return telemetrySubscription_1.unsubscribe(); });
    }
    else {
        var telemetryBatch_1 = (0, browser_core_1.startBatchWithReplica)(configuration, {
            endpoint: configuration.rumEndpointBuilder,
        }, configuration.replica && {
            endpoint: configuration.replica.rumEndpointBuilder,
        }, reportError, pageExitObservable, sessionExpireObservable);
        cleanupTasks.push(function () { return telemetryBatch_1.stop(); });
        var telemetrySubscription_2 = telemetry.observable.subscribe(function (event) {
            return telemetryBatch_1.add(event, (0, browser_core_1.isTelemetryReplicationAllowed)(configuration));
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