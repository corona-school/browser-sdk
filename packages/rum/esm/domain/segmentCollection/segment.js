import { addTelemetryDebug, assign, sendToExtension, addEventListener, concatBuffers } from '@datadog/browser-core';
import { RecordType } from '../../types';
import * as replayStats from '../replayStats';
// Arbitrary id, will be replaced when we have multiple parallel streams.
var STREAM_ID = 1;
var nextId = 0;
var Segment = /** @class */ (function () {
    function Segment(configuration, worker, context, creationReason, initialRecord, onWrote, onFlushed) {
        var _this = this;
        this.worker = worker;
        this.id = nextId++;
        this.pendingWriteCount = 0;
        var viewId = context.view.id;
        this.metadata = assign({
            start: initialRecord.timestamp,
            end: initialRecord.timestamp,
            creation_reason: creationReason,
            records_count: 1,
            has_full_snapshot: initialRecord.type === RecordType.FullSnapshot,
            index_in_view: replayStats.getSegmentsCount(viewId),
            source: 'browser',
        }, context);
        replayStats.addSegment(viewId);
        replayStats.addRecord(viewId);
        var rawBytesCount = 0;
        var compressedBytesCount = 0;
        var compressedData = [];
        var removeMessageListener = addEventListener(configuration, worker, 'message', function (_a) {
            var data = _a.data;
            if (data.type !== 'wrote') {
                return;
            }
            if (data.id === _this.id) {
                _this.pendingWriteCount -= 1;
                replayStats.addWroteData(viewId, data.additionalBytesCount);
                rawBytesCount += data.additionalBytesCount;
                compressedBytesCount += data.result.length;
                compressedData.push(data.result);
                if (_this.flushReason && _this.pendingWriteCount === 0) {
                    compressedData.push(data.trailer);
                    onFlushed(concatBuffers(compressedData), rawBytesCount);
                    removeMessageListener();
                }
                else {
                    onWrote(compressedBytesCount);
                }
            }
            else if (data.id > _this.id) {
                // Messages should be received in the same order as they are sent, so if we receive a
                // message with an id superior to this Segment instance id, we know that another, more
                // recent Segment instance is being used.
                //
                // In theory, a "flush" response should have been received at this point, so the listener
                // should already have been removed. But if something goes wrong and we didn't receive a
                // "flush" response, remove the listener to avoid any leak, and send a monitor message to
                // help investigate the issue.
                removeMessageListener();
                addTelemetryDebug("Segment did not receive a 'flush' response before being replaced.");
            }
        }).stop;
        sendToExtension('record', { record: initialRecord, segment: this.metadata });
        this.write("{\"records\":[".concat(JSON.stringify(initialRecord)));
    }
    Segment.prototype.addRecord = function (record) {
        var _a;
        this.metadata.start = Math.min(this.metadata.start, record.timestamp);
        this.metadata.end = Math.max(this.metadata.end, record.timestamp);
        this.metadata.records_count += 1;
        replayStats.addRecord(this.metadata.view.id);
        (_a = this.metadata).has_full_snapshot || (_a.has_full_snapshot = record.type === RecordType.FullSnapshot);
        sendToExtension('record', { record: record, segment: this.metadata });
        this.write(",".concat(JSON.stringify(record)));
    };
    Segment.prototype.flush = function (reason) {
        this.write("],".concat(JSON.stringify(this.metadata).slice(1), "\n"));
        this.worker.postMessage({
            action: 'reset',
            streamId: STREAM_ID,
        });
        this.flushReason = reason;
    };
    Segment.prototype.write = function (data) {
        this.pendingWriteCount += 1;
        this.worker.postMessage({
            data: data,
            id: this.id,
            streamId: STREAM_ID,
            action: 'write',
        });
    };
    return Segment;
}());
export { Segment };
//# sourceMappingURL=segment.js.map