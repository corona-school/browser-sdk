"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRecording = void 0;
var browser_core_1 = require("@datadog/browser-core");
var record_1 = require("../domain/record");
var segmentCollection_1 = require("../domain/segmentCollection");
var types_1 = require("../types");
function startRecording(lifeCycle, configuration, sessionManager, viewContexts, encoder, httpRequest) {
    var reportError = function (error) {
        lifeCycle.notify(12 /* LifeCycleEventType.RAW_ERROR_COLLECTED */, { error: error });
        (0, browser_core_1.addTelemetryDebug)('Error reported to customer', { 'error.message': error.message });
    };
    var replayRequest = httpRequest ||
        (0, browser_core_1.createHttpRequest)(configuration, configuration.sessionReplayEndpointBuilder, segmentCollection_1.SEGMENT_BYTES_LIMIT, reportError);
    var _a = (0, segmentCollection_1.startSegmentCollection)(lifeCycle, configuration, sessionManager, viewContexts, replayRequest, encoder), addRecord = _a.addRecord, stopSegmentCollection = _a.stop;
    var _b = (0, record_1.record)({
        emit: addRecord,
        configuration: configuration,
        lifeCycle: lifeCycle,
    }), stopRecording = _b.stop, takeSubsequentFullSnapshot = _b.takeSubsequentFullSnapshot, flushMutations = _b.flushMutations;
    var unsubscribeViewEnded = lifeCycle.subscribe(4 /* LifeCycleEventType.VIEW_ENDED */, function () {
        flushMutations();
        addRecord({
            timestamp: (0, browser_core_1.timeStampNow)(),
            type: types_1.RecordType.ViewEnd,
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
exports.startRecording = startRecording;
//# sourceMappingURL=startRecording.js.map