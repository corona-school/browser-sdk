"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRecorderApi = void 0;
var browser_core_1 = require("@datadog/browser-core");
var replayStats_1 = require("../domain/replayStats");
var getSessionReplayLink_1 = require("../domain/getSessionReplayLink");
var segmentCollection_1 = require("../domain/segmentCollection");
var record_1 = require("../domain/record");
var isBrowserSupported_1 = require("./isBrowserSupported");
function makeRecorderApi(startRecordingImpl, startDeflateWorkerImpl) {
    if (startDeflateWorkerImpl === void 0) { startDeflateWorkerImpl = segmentCollection_1.startDeflateWorker; }
    var recorderStartObservable = new browser_core_1.Observable();
    if ((0, browser_core_1.canUseEventBridge)() || !(0, isBrowserSupported_1.isBrowserSupported)()) {
        return {
            start: browser_core_1.noop,
            stop: browser_core_1.noop,
            getReplayStats: function () { return undefined; },
            onRumStart: browser_core_1.noop,
            isRecording: function () { return false; },
            getSessionReplayLink: function () { return undefined; },
            getSerializedNodeId: function () { return undefined; },
            recorderStartObservable: recorderStartObservable,
        };
    }
    var state = {
        status: 0 /* RecorderStatus.Stopped */,
    };
    var startStrategy = function () {
        state = { status: 1 /* RecorderStatus.IntentToStart */ };
    };
    var stopStrategy = function () {
        state = { status: 0 /* RecorderStatus.Stopped */ };
    };
    return {
        start: function () { return startStrategy(); },
        stop: function () { return stopStrategy(); },
        getReplayStats: replayStats_1.getReplayStats,
        getSessionReplayLink: function (configuration, sessionManager, viewContexts) {
            return (0, getSessionReplayLink_1.getSessionReplayLink)(configuration, sessionManager, viewContexts, state.status !== 0 /* RecorderStatus.Stopped */);
        },
        recorderStartObservable: recorderStartObservable,
        getSerializedNodeId: record_1.getSerializedNodeId,
        onRumStart: function (lifeCycle, configuration, sessionManager, viewContexts) {
            lifeCycle.subscribe(7 /* LifeCycleEventType.SESSION_EXPIRED */, function () {
                if (state.status === 2 /* RecorderStatus.Starting */ || state.status === 3 /* RecorderStatus.Started */) {
                    stopStrategy();
                    state = { status: 1 /* RecorderStatus.IntentToStart */ };
                }
            });
            lifeCycle.subscribe(8 /* LifeCycleEventType.SESSION_RENEWED */, function () {
                if (state.status === 1 /* RecorderStatus.IntentToStart */) {
                    startStrategy();
                }
            });
            startStrategy = function () {
                var session = sessionManager.findTrackedSession();
                if (!session || !session.sessionReplayAllowed) {
                    state = { status: 1 /* RecorderStatus.IntentToStart */ };
                    return;
                }
                if (state.status === 2 /* RecorderStatus.Starting */ || state.status === 3 /* RecorderStatus.Started */) {
                    return;
                }
                state = { status: 2 /* RecorderStatus.Starting */ };
                (0, browser_core_1.runOnReadyState)('interactive', function () {
                    if (state.status !== 2 /* RecorderStatus.Starting */) {
                        return;
                    }
                    startDeflateWorkerImpl(function (worker) {
                        if (state.status !== 2 /* RecorderStatus.Starting */) {
                            return;
                        }
                        if (!worker) {
                            state = {
                                status: 0 /* RecorderStatus.Stopped */,
                            };
                            return;
                        }
                        var stopRecording = startRecordingImpl(lifeCycle, configuration, sessionManager, viewContexts, worker).stop;
                        recorderStartObservable.notify((0, browser_core_1.relativeNow)());
                        state = {
                            status: 3 /* RecorderStatus.Started */,
                            stopRecording: stopRecording,
                        };
                    });
                });
            };
            stopStrategy = function () {
                if (state.status === 0 /* RecorderStatus.Stopped */) {
                    return;
                }
                if (state.status === 3 /* RecorderStatus.Started */) {
                    state.stopRecording();
                }
                state = {
                    status: 0 /* RecorderStatus.Stopped */,
                };
            };
            if (state.status === 1 /* RecorderStatus.IntentToStart */) {
                startStrategy();
            }
        },
        isRecording: function () { return state.status === 3 /* RecorderStatus.Started */; },
    };
}
exports.makeRecorderApi = makeRecorderApi;
//# sourceMappingURL=recorderApi.js.map