"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Segment = void 0;
var browser_core_1 = require("@datadog/browser-core");
var types_1 = require("../../types");
var replayStats = __importStar(require("../replayStats"));
var Segment = /** @class */ (function () {
    function Segment(encoder, context, creationReason) {
        this.encoder = encoder;
        var viewId = context.view.id;
        this.metadata = (0, browser_core_1.assign)({
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
        (_a = this.metadata).has_full_snapshot || (_a.has_full_snapshot = record.type === types_1.RecordType.FullSnapshot);
        (0, browser_core_1.sendToExtension)('record', { record: record, segment: this.metadata });
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
exports.Segment = Segment;
//# sourceMappingURL=segment.js.map