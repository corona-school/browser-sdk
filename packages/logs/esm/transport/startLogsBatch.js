import { startBatchWithReplica } from '@datadog/browser-core';
export function startLogsBatch(configuration, lifeCycle, reportError, pageExitObservable, sessionExpireObservable) {
    var _a;
    var batch = startBatchWithReplica(configuration, configuration.logsEndpointBuilder, reportError, pageExitObservable, sessionExpireObservable, (_a = configuration.replica) === null || _a === void 0 ? void 0 : _a.logsEndpointBuilder);
    lifeCycle.subscribe(1 /* LifeCycleEventType.LOG_COLLECTED */, function (serverLogsEvent) {
        batch.add(serverLogsEvent);
    });
}
//# sourceMappingURL=startLogsBatch.js.map