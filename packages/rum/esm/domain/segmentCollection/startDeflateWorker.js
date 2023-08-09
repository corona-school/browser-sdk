import { addTelemetryError, display, includes, addEventListener } from '@datadog/browser-core';
import { workerString } from '@datadog/browser-worker/string';
var workerURL;
export function createDeflateWorker() {
    // Lazily compute the worker URL to allow importing the SDK in NodeJS
    if (!workerURL) {
        workerURL = URL.createObjectURL(new Blob([workerString]));
    }
    return new Worker(workerURL);
}
var state = { status: 0 /* DeflateWorkerStatus.Nil */ };
export function startDeflateWorker(callback, createDeflateWorkerImpl) {
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
export function resetDeflateWorkerState() {
    state = { status: 0 /* DeflateWorkerStatus.Nil */ };
}
/**
 * Starts the deflate worker and handle messages and errors
 *
 * The spec allow browsers to handle worker errors differently:
 * - Chromium throws an exception
 * - Firefox fires an error event
 *
 * more details: https://bugzilla.mozilla.org/show_bug.cgi?id=1736865#c2
 */
export function doStartDeflateWorker(createDeflateWorkerImpl) {
    if (createDeflateWorkerImpl === void 0) { createDeflateWorkerImpl = createDeflateWorker; }
    try {
        var worker_1 = createDeflateWorkerImpl();
        addEventListener(worker_1, 'error', onError);
        addEventListener(worker_1, 'message', function (_a) {
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
function onInitialized(worker, version) {
    if (state.status === 1 /* DeflateWorkerStatus.Loading */) {
        state.callbacks.forEach(function (callback) { return callback(worker); });
        state = { status: 3 /* DeflateWorkerStatus.Initialized */, worker: worker, version: version };
    }
}
function onError(error, streamId) {
    if (state.status === 1 /* DeflateWorkerStatus.Loading */) {
        display.error('Session Replay recording failed to start: an error occurred while creating the Worker:', error);
        if (error instanceof Event || (error instanceof Error && isMessageCspRelated(error.message))) {
            display.error('Please make sure CSP is correctly configured ' +
                'https://docs.datadoghq.com/real_user_monitoring/faq/content_security_policy');
        }
        else {
            addTelemetryError(error);
        }
        state.callbacks.forEach(function (callback) { return callback(); });
        state = { status: 2 /* DeflateWorkerStatus.Error */ };
    }
    else {
        addTelemetryError(error, {
            worker_version: state.status === 3 /* DeflateWorkerStatus.Initialized */ && state.version,
            stream_id: streamId,
        });
    }
}
function isMessageCspRelated(message) {
    return (includes(message, 'Content Security Policy') ||
        // Related to `require-trusted-types-for` CSP: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/require-trusted-types-for
        includes(message, "requires 'TrustedScriptURL'"));
}
//# sourceMappingURL=startDeflateWorker.js.map