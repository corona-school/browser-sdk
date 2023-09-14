import { display } from '../tools/display';
import { objectValues } from '../tools/utils/polyfills';
import { isPageExitReason } from '../browser/pageExitObservable';
import { computeBytesCount } from '../tools/utils/byteUtils';
import { jsonStringify } from '../tools/serialisation/jsonStringify';
var Batch = /** @class */ (function () {
    function Batch(request, flushController, messageBytesLimit) {
        var _this = this;
        this.request = request;
        this.flushController = flushController;
        this.messageBytesLimit = messageBytesLimit;
        this.pushOnlyBuffer = [];
        this.upsertBuffer = {};
        this.flushSubscription = this.flushController.flushObservable.subscribe(function (event) { return _this.flush(event); });
    }
    Batch.prototype.add = function (message) {
        this.addOrUpdate(message);
    };
    Batch.prototype.upsert = function (message, key) {
        this.addOrUpdate(message, key);
    };
    Batch.prototype.stop = function () {
        this.flushSubscription.unsubscribe();
    };
    Batch.prototype.flush = function (event) {
        var messages = this.pushOnlyBuffer.concat(objectValues(this.upsertBuffer));
        this.pushOnlyBuffer = [];
        this.upsertBuffer = {};
        var payload = { data: messages.join('\n'), bytesCount: event.bytesCount, flushReason: event.reason };
        if (isPageExitReason(event.reason)) {
            this.request.sendOnExit(payload);
        }
        else {
            this.request.send(payload);
        }
    };
    Batch.prototype.addOrUpdate = function (message, key) {
        var _a = this.process(message), processedMessage = _a.processedMessage, messageBytesCount = _a.messageBytesCount;
        if (messageBytesCount >= this.messageBytesLimit) {
            display.warn("Discarded a message whose size was bigger than the maximum allowed size ".concat(this.messageBytesLimit, "KB."));
            return;
        }
        if (this.hasMessageFor(key)) {
            this.remove(key);
        }
        this.push(processedMessage, messageBytesCount, key);
    };
    Batch.prototype.process = function (message) {
        var processedMessage = jsonStringify(message);
        var messageBytesCount = computeBytesCount(processedMessage);
        return { processedMessage: processedMessage, messageBytesCount: messageBytesCount };
    };
    Batch.prototype.push = function (processedMessage, messageBytesCount, key) {
        // If there are other messages, a '\n' will be added at serialization
        var separatorBytesCount = this.flushController.messagesCount > 0 ? 1 : 0;
        this.flushController.notifyBeforeAddMessage(messageBytesCount + separatorBytesCount);
        if (key !== undefined) {
            this.upsertBuffer[key] = processedMessage;
        }
        else {
            this.pushOnlyBuffer.push(processedMessage);
        }
        this.flushController.notifyAfterAddMessage();
    };
    Batch.prototype.remove = function (key) {
        var removedMessage = this.upsertBuffer[key];
        delete this.upsertBuffer[key];
        var messageBytesCount = computeBytesCount(removedMessage);
        // If there are other messages, a '\n' will be added at serialization
        var separatorBytesCount = this.flushController.messagesCount > 1 ? 1 : 0;
        this.flushController.notifyAfterRemoveMessage(messageBytesCount + separatorBytesCount);
    };
    Batch.prototype.hasMessageFor = function (key) {
        return key !== undefined && this.upsertBuffer[key] !== undefined;
    };
    return Batch;
}());
export { Batch };
//# sourceMappingURL=batch.js.map