import { startBatchWithReplica } from '@datadog/browser-core';
export function startLogsBatch(configuration, lifeCycle, reportError, pageExitObservable, sessionExpireObservable) {
    var batch = startBatchWithReplica(configuration, {
        endpoint: configuration.logsEndpointBuilder,
    }, configuration.replica && {
        endpoint: configuration.replica.logsEndpointBuilder,
    }, reportError, pageExitObservable, sessionExpireObservable);
    lifeCycle.subscribe(1 /* LifeCycleEventType.LOG_COLLECTED */, function (serverLogsEvent) {
        batch.add(serverLogsEvent);
    });
    return batch;
}
//# sourceMappingURL=startLogsBatch.js.map