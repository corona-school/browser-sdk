import { addTelemetryDebug, elapsed, noop, performDraw, relativeNow, toServerDuration } from '@datadog/browser-core';
export function startWebVitalTelemetryDebug(configuration, telemetry, recorderApi, session) {
    var webVitalTelemetryEnabled = telemetry.enabled && performDraw(configuration.customerDataTelemetrySampleRate);
    if (!webVitalTelemetryEnabled) {
        return {
            addWebVitalTelemetryDebug: noop,
        };
    }
    return {
        addWebVitalTelemetryDebug: function (webVitalName, webVitalNode, webVitalTime) {
            var _a;
            var computationTime = relativeNow();
            if (!recorderApi.isRecording()) {
                recorderApi.recorderStartObservable.subscribe(function (recordingStartTime) {
                    addTelemetryDebug("".concat(webVitalName, " attribution recording delay"), {
                        computationDelay: toServerDuration(elapsed(webVitalTime, computationTime)),
                        recordingDelay: toServerDuration(elapsed(webVitalTime, recordingStartTime)),
                        hasNode: !!webVitalNode,
                        serializedDomNode: webVitalNode ? recorderApi.getSerializedNodeId(webVitalNode) : undefined,
                    });
                });
            }
            addTelemetryDebug("".concat(webVitalName, " attribution"), {
                computationDelay: toServerDuration(elapsed(webVitalTime, computationTime)),
                hasNode: !!webVitalNode,
                replayRecording: recorderApi.isRecording(),
                replaySampled: (_a = session.findTrackedSession()) === null || _a === void 0 ? void 0 : _a.sessionReplayAllowed,
                serializedDomNode: webVitalNode ? recorderApi.getSerializedNodeId(webVitalNode) : undefined,
            });
        },
    };
}
//# sourceMappingURL=startWebVitalTelemetryDebug.js.map