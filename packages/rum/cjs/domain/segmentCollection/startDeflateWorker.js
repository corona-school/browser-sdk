"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doStartDeflateWorker = exports.resetDeflateWorkerState = exports.startDeflateWorker = exports.createDeflateWorker = void 0;
var browser_core_1 = require("@datadog/browser-core");
var string_1 = require("@datadog/browser-worker/string");
var workerURL;
function createDeflateWorker() {
    // Lazily compute the worker URL to allow importing the SDK in NodeJS
    if (!workerURL) {
        workerURL = URL.createObjectURL(new Blob([string_1.workerString]));
    }
    return new Worker(workerURL);
}
exports.createDeflateWorker = createDeflateWorker;
var state = { status: 0 /* DeflateWorkerStatus.Nil */ };
function startDeflateWorker(callback, createDeflateWorkerImpl) {
    if (createDeflateWorkerImpl === void 0) { createDeflateWorkerImpl = createDeflateWorker; }
    switch (state.status) {
        case 0 /* DeflateWorkerStatus.Nil */:
            state = { status: 1 /* DeflateWorkerStatus.Loading */, callbacks: [callback] };
            doStartDeflateWorker(createDeflateWorkerImpl);
            break;
        case 1 /* DeflateWorkerStatus.Loading */:
            state.callbacks.push(callback);
            break;
        case 2 /* DeflateWorkerStatus.Error */:
            callback();
            break;
        case 3 /* DeflateWorkerStatus.Initialized */:
            callback(state.worker);
            break;
    }
}
exports.startDeflateWorker = startDeflateWorker;
function resetDeflateWorkerState() {
    state = { status: 0 /* DeflateWorkerStatus.Nil */ };
}
exports.resetDeflateWorkerState = resetDeflateWorkerState;
/**
 * Starts the deflate worker and handle messages and errors
 *
 * The spec allow browsers to handle worker errors differently:
 * - Chromium throws an exception
 * - Firefox fires an error event
 *
 * more details: https://bugzilla.mozilla.org/show_bug.cgi?id=1736865#c2
 */
function doStartDeflateWorker(createDeflateWorkerImpl) {
    if (createDeflateWorkerImpl === void 0) { createDeflateWorkerImpl = createDeflateWorker; }
    try {
        var worker_1 = createDeflateWorkerImpl();
        (0, browser_core_1.addEventListener)(worker_1, 'error', onError);
        (0, browser_core_1.addEventListener)(worker_1, 'message', function (_a) {
            var data = _a.data;
            if (data.type === 'errored') {
                onError(data.error, data.streamId);
            }
            else if (data.type === 'initialized') {
                onInitialized(worker_1, data.version);
            }
        });
        worker_1.postMessage({ action: 'init' });
        return worker_1;
    }
    catch (error) {
        onError(error);
    }
}
exports.doStartDeflateWorker = doStartDeflateWorker;
function onInitialized(worker, version) {
    if (state.status === 1 /* DeflateWorkerStatus.Loading */) {
        state.callbacks.forEach(function (callback) { return callback(worker); });
        state = { status: 3 /* DeflateWorkerStatus.Initialized */, worker: worker, version: version };
    }
}
function onError(error, streamId) {
    if (state.status === 1 /* DeflateWorkerStatus.Loading */) {
        browser_core_1.display.error('Session Replay recording failed to start: an error occurred while creating the Worker:', error);
        if (error instanceof Event || (error instanceof Error && isMessageCspRelated(error.message))) {
            browser_core_1.display.error('Please make sure CSP is correctly configured ' +
                'https://docs.datadoghq.com/real_user_monitoring/faq/content_security_policy');
        }
        else {
            (0, browser_core_1.addTelemetryError)(error);
        }
        state.callbacks.forEach(function (callback) { return callback(); });
        state = { status: 2 /* DeflateWorkerStatus.Error */ };
    }
    else {
        (0, browser_core_1.addTelemetryError)(error, {
            worker_version: state.status === 3 /* DeflateWorkerStatus.Initialized */ && state.version,
            stream_id: streamId,
        });
    }
}
function isMessageCspRelated(message) {
    return ((0, browser_core_1.includes)(message, 'Content Security Policy') ||
        // Related to `require-trusted-types-for` CSP: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/require-trusted-types-for
        (0, browser_core_1.includes)(message, "requires 'TrustedScriptURL'"));
}
//# sourceMappingURL=startDeflateWorker.js.map