"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doStartDeflateWorker = exports.resetDeflateWorkerState = exports.startDeflateWorker = exports.createDeflateWorker = exports.INITIALIZATION_TIME_OUT_DELAY = void 0;
var browser_core_1 = require("@datadog/browser-core");
var string_1 = require("@datadog/browser-worker/string");
exports.INITIALIZATION_TIME_OUT_DELAY = 10 * browser_core_1.ONE_SECOND;
var workerBlobUrl;
function createWorkerBlobUrl() {
    // Lazily compute the worker URL to allow importing the SDK in NodeJS
    if (!workerBlobUrl) {
        workerBlobUrl = URL.createObjectURL(new Blob([string_1.workerString]));
    }
    return workerBlobUrl;
}
function createDeflateWorker(configuration) {
    return new Worker(configuration.workerUrl || createWorkerBlobUrl());
}
exports.createDeflateWorker = createDeflateWorker;
var state = { status: 0 /* DeflateWorkerStatus.Nil */ };
function startDeflateWorker(configuration, callback, createDeflateWorkerImpl) {
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
function doStartDeflateWorker(configuration, createDeflateWorkerImpl) {
    if (createDeflateWorkerImpl === void 0) { createDeflateWorkerImpl = createDeflateWorker; }
    try {
        var worker_1 = createDeflateWorkerImpl(configuration);
        (0, browser_core_1.addEventListener)(configuration, worker_1, 'error', function (error) {
            onError(configuration, error);
        });
        (0, browser_core_1.addEventListener)(configuration, worker_1, 'message', function (_a) {
            var data = _a.data;
            if (data.type === 'errored') {
                onError(configuration, data.error, data.streamId);
            }
            else if (data.type === 'initialized') {
                onInitialized(worker_1, data.version);
            }
        });
        worker_1.postMessage({ action: 'init' });
        (0, browser_core_1.setTimeout)(onTimeout, exports.INITIALIZATION_TIME_OUT_DELAY);
        return worker_1;
    }
    catch (error) {
        onError(configuration, error);
    }
}
exports.doStartDeflateWorker = doStartDeflateWorker;
function onTimeout() {
    if (state.status === 1 /* DeflateWorkerStatus.Loading */) {
        browser_core_1.display.error('Session Replay recording failed to start: a timeout occurred while initializing the Worker');
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
        browser_core_1.display.error('Session Replay recording failed to start: an error occurred while creating the Worker:', error);
        if (error instanceof Event || (error instanceof Error && isMessageCspRelated(error.message))) {
            var baseMessage = void 0;
            if (configuration.workerUrl) {
                baseMessage = "Please make sure the Worker URL ".concat(configuration.workerUrl, " is correct and CSP is correctly configured.");
            }
            else {
                baseMessage = 'Please make sure CSP is correctly configured.';
            }
            browser_core_1.display.error("".concat(baseMessage, " See documentation at https://docs.datadoghq.com/integrations/content_security_policy_logs/#use-csp-with-real-user-monitoring-and-session-replay"));
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