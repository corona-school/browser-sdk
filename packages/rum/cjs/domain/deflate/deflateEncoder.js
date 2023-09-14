"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeflateEncoder = void 0;
var browser_core_1 = require("@datadog/browser-core");
function createDeflateEncoder(configuration, worker, streamId) {
    var rawBytesCount = 0;
    var compressedData = [];
    var compressedDataTrailer;
    var nextWriteActionId = 0;
    var pendingWriteActions = [];
    var removeMessageListener = (0, browser_core_1.addEventListener)(configuration, worker, 'message', function (_a) {
        var data = _a.data;
        if (data.type !== 'wrote' || data.streamId !== streamId) {
            return;
        }
        var nextPendingAction = pendingWriteActions.shift();
        if (nextPendingAction && nextPendingAction.id === data.id) {
            if (data.id === 0) {
                // Initial state
                rawBytesCount = data.additionalBytesCount;
                compressedData = [data.result];
            }
            else {
                rawBytesCount += data.additionalBytesCount;
                compressedData.push(data.result);
            }
            compressedDataTrailer = data.trailer;
            nextPendingAction.callback();
        }
        else {
            removeMessageListener();
            (0, browser_core_1.addTelemetryDebug)('Worker responses received out of order.');
        }
    }).stop;
    return {
        get encodedBytes() {
            if (!compressedData.length) {
                return new Uint8Array(0);
            }
            return (0, browser_core_1.concatBuffers)(compressedData.concat(compressedDataTrailer));
        },
        get encodedBytesCount() {
            if (!compressedData.length) {
                return 0;
            }
            return compressedData.reduce(function (total, buffer) { return total + buffer.length; }, 0) + compressedDataTrailer.length;
        },
        get rawBytesCount() {
            return rawBytesCount;
        },
        write: function (data, callback) {
            worker.postMessage({
                action: 'write',
                id: nextWriteActionId,
                data: data,
                streamId: streamId,
            });
            pendingWriteActions.push({
                id: nextWriteActionId,
                callback: callback,
            });
            nextWriteActionId += 1;
        },
        reset: function () {
            worker.postMessage({
                action: 'reset',
                streamId: streamId,
            });
            nextWriteActionId = 0;
        },
        stop: function () {
            removeMessageListener();
        },
    };
}
exports.createDeflateEncoder = createDeflateEncoder;
//# sourceMappingURL=deflateEncoder.js.map