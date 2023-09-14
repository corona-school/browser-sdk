import { Observable, canUseEventBridge, noop, runOnReadyState, relativeNow } from '@datadog/browser-core';
import { getReplayStats as getReplayStatsImpl } from '../domain/replayStats';
import { getSessionReplayLink } from '../domain/getSessionReplayLink';
import { createDeflateEncoder, startDeflateWorker, getDeflateWorkerStatus, } from '../domain/deflate';
import { getSerializedNodeId } from '../domain/record';
import { isBrowserSupported } from './isBrowserSupported';
export function makeRecorderApi(startRecordingImpl, createDeflateWorkerImpl) {
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
                    var worker = startDeflateWorker(configuration, function () {
                        stopStrategy();
                    }, createDeflateWorkerImpl);
                    if (!worker) {
                        state = {
                            status: 0 /* RecorderStatus.Stopped */,
                        };
                        return;
                    }
                    var stopRecording = startRecordingImpl(lifeCycle, configuration, sessionManager, viewContexts, createDeflateEncoder(configuration, worker, 1 /* DeflateEncoderStreamId.REPLAY */)).stop;
                    recorderStartObservable.notify(relativeNow());
                    state = {
                        status: 3 /* RecorderStatus.Started */,
                        stopRecording: stopRecording,
                    };
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
        isRecording: function () {
            // The worker is started optimistically, meaning we could have started to record but its
            // initialization fails a bit later. This could happen when:
            // * the worker URL (blob or plain URL) is blocked by CSP in Firefox only (Chromium and Safari
            // throw an exception when instantiating the worker, and IE doesn't care about CSP)
            // * the browser fails to load the worker in case the workerUrl is used
            // * an unexpected error occurs in the Worker before initialization, ex:
            //   * a runtime exception collected by monitor()
            //   * a syntax error notified by the browser via an error event
            // * the worker is unresponsive for some reason and timeouts
            //
            // It is not expected to happen often. Nonetheless, the "replayable" status on RUM events is
            // an important part of the Datadog App:
            // * If we have a false positive (we set has_replay: true even if no replay data is present),
            // we might display broken links to the Session Replay player.
            // * If we have a false negative (we don't set has_replay: true even if replay data is
            // available), it is less noticeable because no link will be displayed.
            //
            // Thus, it is better to have false negative, so let's make sure the worker is correctly
            // initialized before advertizing that we are recording.
            //
            // In the future, when the compression worker will also be used for RUM data, this will be
            // less important since no RUM event will be sent when the worker fails to initialize.
            return getDeflateWorkerStatus() === 3 /* DeflateWorkerStatus.Initialized */ && state.status === 3 /* RecorderStatus.Started */;
        },
        getReplayStats: function (viewId) {
            return getDeflateWorkerStatus() === 3 /* DeflateWorkerStatus.Initialized */ ? getReplayStatsImpl(viewId) : undefined;
        },
    };
}
//# sourceMappingURL=recorderApi.js.map