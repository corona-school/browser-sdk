"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRumBatch = void 0;
var browser_core_1 = require("@datadog/browser-core");
function startRumBatch(configuration, lifeCycle, telemetryEventObservable, reportError, pageExitObservable, sessionExpireObservable) {
    var replica = configuration.replica;
    var batch = (0, browser_core_1.startBatchWithReplica)(configuration, {
        endpoint: configuration.rumEndpointBuilder,
    }, replica && {
        endpoint: replica.rumEndpointBuilder,
        transformMessage: function (message) { return (0, browser_core_1.combine)(message, { application: { id: replica.applicationId } }); },
    }, reportError, pageExitObservable, sessionExpireObservable);
    lifeCycle.subscribe(11 /* LifeCycleEventType.RUM_EVENT_COLLECTED */, function (serverRumEvent) {
        if (serverRumEvent.type === "view" /* RumEventType.VIEW */) {
            batch.upsert(serverRumEvent, serverRumEvent.view.id);
        }
        else {
            batch.add(serverRumEvent);
        }
    });
    telemetryEventObservable.subscribe(function (event) { return batch.add(event, (0, browser_core_1.isTelemetryReplicationAllowed)(configuration)); });
    return batch;
}
exports.startRumBatch = startRumBatch;
//# sourceMappingURL=startRumBatch.js.map