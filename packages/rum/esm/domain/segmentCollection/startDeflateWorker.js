import { addTelemetryError, display, includes, addEventListener, setTimeout, ONE_SECOND } from '@datadog/browser-core';
import { workerString } from '@datadog/browser-worker/string';
export var INITIALIZATION_TIME_OUT_DELAY = 10 * ONE_SECOND;
var workerBlobUrl;
function createWorkerBlobUrl() {
    // Lazily compute the worker URL to allow importing the SDK in NodeJS
    if (!workerBlobUrl) {
        workerBlobUrl = URL.createObjectURL(new Blob([workerString]));
    }
    return workerBlobUrl;
}
export function createDeflateWorker(configuration) {
    return new Worker(configuration.workerUrl || createWorkerBlobUrl());
}
var state = { status: 0 /* DeflateWorkerStatus.Nil */ };
export function startDeflateWorker(configuration, callback, createDeflateWorkerImpl) {
    if (createDeflateWorkerImpl === void 0) { createDeflateWorkerImpl = createDeflateWorker; }
    switch (state.status) {
        case 0 /* DeflateWorkerStatus.Nil */:
            state = { status: 1 /* DeflateWorkerStatus.Loading */, callbacks: [callback] };
            doStartDeflateWorker(configuration, createDeflateWorkerImpl);
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
export function doStartDeflateWorker(configuration, createDeflateWorkerImpl) {
    if (createDeflateWorkerImpl === void 0) { createDeflateWorkerImpl = createDeflateWorker; }
    try {
        var worker_1 = createDeflateWorkerImpl(configuration);
        addEventListener(configuration, worker_1, 'error', function (error) {
            onError(configuration, error);
        });
        addEventListener(configuration, worker_1, 'message', function (_a) {
            var data = _a.data;
            if (data.type === 'errored') {
                onError(configuration, data.error, data.streamId);
            }
            else if (data.type === 'initialized') {
                onInitialized(worker_1, data.version);
            }
        });
        worker_1.postMessage({ action: 'init' });
        setTimeout(onTimeout, INITIALIZATION_TIME_OUT_DELAY);
        return worker_1;
    }
    catch (error) {
        onError(configuration, error);
    }
}
function onTimeout() {
    if (state.status === 1 /* DeflateWorkerStatus.Loading */) {
        display.error('Session Replay recording failed to start: a timeout occurred while initializing the Worker');
        state.callbacks.forEach(function (callback) { return callback(); });
        state = { status: 2 /* DeflateWorkerStatus.Error */ };
    }
}
function onInitialized(worker, version) {
    if (state.status === 1 /* DeflateWorkerStatus.Loading */) {
        state.callbacks.forEach(function (callback) { return callback(worker); });
        state = { status: 3 /* DeflateWorkerStatus.Initialized */, worker: worker, version: version };
    }
}
function onError(configuration, error, streamId) {
    if (state.status === 1 /* DeflateWorkerStatus.Loading */) {
        display.error('Session Replay recording failed to start: an error occurred while creating the Worker:', error);
        if (error instanceof Event || (error instanceof Error && isMessageCspRelated(error.message))) {
            var baseMessage = void 0;
            if (configuration.workerUrl) {
                baseMessage = "Please make sure the Worker URL ".concat(configuration.workerUrl, " is correct and CSP is correctly configured.");
            }
            else {
                baseMessage = 'Please make sure CSP is correctly configured.';
            }
            display.error("".concat(baseMessage, " See documentation at https://docs.datadoghq.com/integrations/content_security_policy_logs/#use-csp-with-real-user-monitoring-and-session-replay"));
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