import { Observable, canUseEventBridge, noop, runOnReadyState, relativeNow } from '@datadog/browser-core';
import { getReplayStats } from '../domain/replayStats';
import { getSessionReplayLink } from '../domain/getSessionReplayLink';
import { startDeflateWorker } from '../domain/segmentCollection';
import { getSerializedNodeId } from '../domain/record';
import { isBrowserSupported } from './isBrowserSupported';
export function makeRecorderApi(startRecordingImpl, startDeflateWorkerImpl) {
    if (startDeflateWorkerImpl === void 0) { startDeflateWorkerImpl = startDeflateWorker; }
    var recorderStartObservable = new Observable();
    if (canUseEventBridge() || !isBrowserSupported()) {
        return {
            start: noop,
            stop: noop,
            getReplayStats: function () { return undefined; },
            onRumStart: noop,
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
        getReplayStats: getReplayStats,
        getSessionReplayLink: function (configuration, sessionManager, viewContexts) {
            return getSessionReplayLink(configuration, sessionManager, viewContexts, state.status !== 0 /* RecorderStatus.Stopped */);
        },
        recorderStartObservable: recorderStartObservable,
        getSerializedNodeId: getSerializedNodeId,
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
                runOnReadyState(configuration, 'interactive', function () {
                    if (state.status !== 2 /* RecorderStatus.Starting */) {
                        return;
                    }
                    startDeflateWorkerImpl(configuration, function (worker) {
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
                        recorderStartObservable.notify(relativeNow());
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
//# sourceMappingURL=recorderApi.js.map