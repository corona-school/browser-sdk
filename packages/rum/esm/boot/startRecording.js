import { timeStampNow, createHttpRequest, addTelemetryDebug } from '@datadog/browser-core';
import { record } from '../domain/record';
import { startSegmentCollection, SEGMENT_BYTES_LIMIT } from '../domain/segmentCollection';
import { RecordType } from '../types';
export function startRecording(lifeCycle, configuration, sessionManager, viewContexts, encoder, httpRequest) {
    var reportError = function (error) {
        lifeCycle.notify(12 /* LifeCycleEventType.RAW_ERROR_COLLECTED */, { error: error });
        addTelemetryDebug('Error reported to customer', { 'error.message': error.message });
    };
    var replayRequest = httpRequest ||
        createHttpRequest(configuration, configuration.sessionReplayEndpointBuilder, SEGMENT_BYTES_LIMIT, reportError);
    var _a = startSegmentCollection(lifeCycle, configuration, sessionManager, viewContexts, replayRequest, encoder), addRecord = _a.addRecord, stopSegmentCollection = _a.stop;
    var _b = record({
        emit: addRecord,
        configuration: configuration,
        lifeCycle: lifeCycle,
    }), stopRecording = _b.stop, takeSubsequentFullSnapshot = _b.takeSubsequentFullSnapshot, flushMutations = _b.flushMutations;
    var unsubscribeViewEnded = lifeCycle.subscribe(4 /* LifeCycleEventType.VIEW_ENDED */, function () {
        flushMutations();
        addRecord({
            timestamp: timeStampNow(),
            type: RecordType.ViewEnd,
        });
    }).unsubscribe;
    var unsubscribeViewCreated = lifeCycle.subscribe(2 /* LifeCycleEventType.VIEW_CREATED */, function (view) {
        takeSubsequentFullSnapshot(view.startClocks.timeStamp);
    }).unsubscribe;
    return {
        stop: function () {
            unsubscribeViewEnded();
            unsubscribeViewCreated();
            stopRecording();
            stopSegmentCollection();
        },
    };
}
//# sourceMappingURL=startRecording.js.map