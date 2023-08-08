"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBatchWithReplica = void 0;
var batch_1 = require("./batch");
var httpRequest_1 = require("./httpRequest");
var flushController_1 = require("./flushController");
function startBatchWithReplica(configuration, endpoint, reportError, pageExitObservable, sessionExpireObservable, replicaEndpoint) {
    var primaryBatch = createBatch(endpoint);
    var replicaBatch;
    if (replicaEndpoint) {
        replicaBatch = createBatch(replicaEndpoint);
    }
    function createBatch(endpointBuilder) {
        return new batch_1.Batch((0, httpRequest_1.createHttpRequest)(endpointBuilder, configuration.batchBytesLimit, reportError), (0, flushController_1.createFlushController)({
            messagesLimit: configuration.batchMessagesLimit,
            bytesLimit: configuration.batchBytesLimit,
            durationLimit: configuration.flushTimeout,
            pageExitObservable: pageExitObservable,
            sessionExpireObservable: sessionExpireObservable,
        }), configuration.messageBytesLimit);
    }
    return {
        add: function (message, replicated) {
            if (replicated === void 0) { replicated = true; }
            primaryBatch.add(message);
            if (replicaBatch && replicated) {
                replicaBatch.add(message);
            }
        },
    };
}
exports.startBatchWithReplica = startBatchWithReplica;
//# sourceMappingURL=startBatchWithReplica.js.map