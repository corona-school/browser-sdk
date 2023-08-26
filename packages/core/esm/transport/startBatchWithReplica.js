import { Batch } from './batch';
import { createHttpRequest } from './httpRequest';
import { createFlushController } from './flushController';
export function startBatchWithReplica(configuration, endpoint, reportError, pageExitObservable, sessionExpireObservable, replicaEndpoint) {
    var primaryBatch = createBatch(configuration, endpoint);
    var replicaBatch;
    if (replicaEndpoint) {
        replicaBatch = createBatch(configuration, replicaEndpoint);
    }
    function createBatch(configuration, endpointBuilder) {
        return new Batch(createHttpRequest(configuration, endpointBuilder, configuration.batchBytesLimit, reportError), createFlushController({
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
//# sourceMappingURL=startBatchWithReplica.js.map