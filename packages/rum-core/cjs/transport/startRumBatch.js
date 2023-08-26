"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRumBatch = void 0;
var browser_core_1 = require("@datadog/browser-core");
function startRumBatch(configuration, lifeCycle, telemetryEventObservable, reportError, pageExitObservable, sessionExpireObservable) {
    var batch = makeRumBatch(configuration, reportError, pageExitObservable, sessionExpireObservable);
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
function makeRumBatch(configuration, reportError, pageExitObservable, sessionExpireObservable) {
    var _a = createRumBatch(configuration.rumEndpointBuilder), primaryBatch = _a.batch, primaryFlushController = _a.flushController;
    var replicaBatch;
    var replica = configuration.replica;
    if (replica !== undefined) {
        replicaBatch = createRumBatch(replica.rumEndpointBuilder).batch;
    }
    function createRumBatch(endpointBuilder) {
        var flushController = (0, browser_core_1.createFlushController)({
            messagesLimit: configuration.batchMessagesLimit,
            bytesLimit: configuration.batchBytesLimit,
            durationLimit: configuration.flushTimeout,
            pageExitObservable: pageExitObservable,
            sessionExpireObservable: sessionExpireObservable,
        });
        var batch = new browser_core_1.Batch((0, browser_core_1.createHttpRequest)(configuration, endpointBuilder, configuration.batchBytesLimit, reportError), flushController, configuration.messageBytesLimit);
        return {
            batch: batch,
            flushController: flushController,
        };
    }
    function withReplicaApplicationId(message) {
        return (0, browser_core_1.combine)(message, { application: { id: replica.applicationId } });
    }
    return {
        flushObservable: primaryFlushController.flushObservable,
        add: function (message, replicated) {
            if (replicated === void 0) { replicated = true; }
            primaryBatch.add(message);
            if (replicaBatch && replicated) {
                replicaBatch.add(withReplicaApplicationId(message));
            }
        },
        upsert: function (message, key) {
            primaryBatch.upsert(message, key);
            if (replicaBatch) {
                replicaBatch.upsert(withReplicaApplicationId(message), key);
            }
        },
    };
}
//# sourceMappingURL=startRumBatch.js.map