"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Batch = void 0;
var display_1 = require("../tools/display");
var polyfills_1 = require("../tools/utils/polyfills");
var pageExitObservable_1 = require("../browser/pageExitObservable");
var byteUtils_1 = require("../tools/utils/byteUtils");
var jsonStringify_1 = require("../tools/serialisation/jsonStringify");
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
        var messages = this.pushOnlyBuffer.concat((0, polyfills_1.objectValues)(this.upsertBuffer));
        this.pushOnlyBuffer = [];
        this.upsertBuffer = {};
        var payload = { data: messages.join('\n'), bytesCount: event.bytesCount, flushReason: event.reason };
        if ((0, pageExitObservable_1.isPageExitReason)(event.reason)) {
            this.request.sendOnExit(payload);
        }
        else {
            this.request.send(payload);
        }
    };
    Batch.prototype.addOrUpdate = function (message, key) {
        var _a = this.process(message), processedMessage = _a.processedMessage, messageBytesCount = _a.messageBytesCount;
        if (messageBytesCount >= this.messageBytesLimit) {
            display_1.display.warn("Discarded a message whose size was bigger than the maximum allowed size ".concat(this.messageBytesLimit, "KB."));
            return;
        }
        if (this.hasMessageFor(key)) {
            this.remove(key);
        }
        this.push(processedMessage, messageBytesCount, key);
    };
    Batch.prototype.process = function (message) {
        var processedMessage = (0, jsonStringify_1.jsonStringify)(message);
        var messageBytesCount = (0, byteUtils_1.computeBytesCount)(processedMessage);
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
        var messageBytesCount = (0, byteUtils_1.computeBytesCount)(removedMessage);
        // If there are other messages, a '\n' will be added at serialization
        var separatorBytesCount = this.flushController.messagesCount > 1 ? 1 : 0;
        this.flushController.notifyAfterRemoveMessage(messageBytesCount + separatorBytesCount);
    };
    Batch.prototype.hasMessageFor = function (key) {
        return key !== undefined && this.upsertBuffer[key] !== undefined;
    };
    return Batch;
}());
exports.Batch = Batch;
//# sourceMappingURL=batch.js.map