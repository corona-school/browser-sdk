import { assign, sendToExtension } from '@datadog/browser-core';
import { RecordType } from '../../types';
import * as replayStats from '../replayStats';
var Segment = /** @class */ (function () {
    function Segment(encoder, context, creationReason) {
        this.encoder = encoder;
        var viewId = context.view.id;
        this.metadata = assign({
            start: Infinity,
            end: -Infinity,
            creation_reason: creationReason,
            records_count: 0,
            has_full_snapshot: false,
            index_in_view: replayStats.getSegmentsCount(viewId),
            source: 'browser',
        }, context);
        replayStats.addSegment(viewId);
    }
    Segment.prototype.addRecord = function (record, callback) {
        var _a;
        this.metadata.start = Math.min(this.metadata.start, record.timestamp);
        this.metadata.end = Math.max(this.metadata.end, record.timestamp);
        this.metadata.records_count += 1;
        (_a = this.metadata).has_full_snapshot || (_a.has_full_snapshot = record.type === RecordType.FullSnapshot);
        sendToExtension('record', { record: record, segment: this.metadata });
        replayStats.addRecord(this.metadata.view.id);
        var prefix = this.metadata.records_count === 1 ? '{"records":[' : ',';
        this.encoder.write(prefix + JSON.stringify(record), callback);
    };
    Segment.prototype.flush = function (callback) {
        var _this = this;
        if (this.metadata.records_count === 0) {
            throw new Error('Empty segment flushed');
        }
        this.encoder.write("],".concat(JSON.stringify(this.metadata).slice(1), "\n"), function () {
            replayStats.addWroteData(_this.metadata.view.id, _this.encoder.rawBytesCount);
            callback(_this.metadata);
        });
        this.encoder.reset();
    };
    return Segment;
}());
export { Segment };
//# sourceMappingURL=segment.js.map