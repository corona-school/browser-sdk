"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startLogsBatch = void 0;
var browser_core_1 = require("@datadog/browser-core");
function startLogsBatch(configuration, lifeCycle, reportError, pageExitObservable, sessionExpireObservable) {
    var batch = (0, browser_core_1.startBatchWithReplica)(configuration, {
        endpoint: configuration.logsEndpointBuilder,
    }, configuration.replica && {
        endpoint: configuration.replica.logsEndpointBuilder,
    }, reportError, pageExitObservable, sessionExpireObservable);
    lifeCycle.subscribe(1 /* LifeCycleEventType.LOG_COLLECTED */, function (serverLogsEvent) {
        batch.add(serverLogsEvent);
    });
    return batch;
}
exports.startLogsBatch = startLogsBatch;
//# sourceMappingURL=startLogsBatch.js.map