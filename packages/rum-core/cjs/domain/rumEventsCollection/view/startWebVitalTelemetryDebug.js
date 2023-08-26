"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWebVitalTelemetryDebug = void 0;
var browser_core_1 = require("@datadog/browser-core");
function startWebVitalTelemetryDebug(configuration, telemetry, recorderApi, session) {
    var webVitalTelemetryEnabled = telemetry.enabled && (0, browser_core_1.performDraw)(configuration.customerDataTelemetrySampleRate);
    if (!webVitalTelemetryEnabled) {
        return {
            addWebVitalTelemetryDebug: browser_core_1.noop,
        };
    }
    return {
        addWebVitalTelemetryDebug: function (webVitalName, webVitalNode, webVitalTime) {
            var _a;
            var computationTime = (0, browser_core_1.relativeNow)();
            if (!recorderApi.isRecording()) {
                recorderApi.recorderStartObservable.subscribe(function (recordingStartTime) {
                    (0, browser_core_1.addTelemetryDebug)("".concat(webVitalName, " attribution recording delay"), {
                        computationDelay: (0, browser_core_1.toServerDuration)((0, browser_core_1.elapsed)(webVitalTime, computationTime)),
                        recordingDelay: (0, browser_core_1.toServerDuration)((0, browser_core_1.elapsed)(webVitalTime, recordingStartTime)),
                        hasNode: !!webVitalNode,
                        serializedDomNode: webVitalNode ? recorderApi.getSerializedNodeId(webVitalNode) : undefined,
                    });
                });
            }
            (0, browser_core_1.addTelemetryDebug)("".concat(webVitalName, " attribution"), {
                computationDelay: (0, browser_core_1.toServerDuration)((0, browser_core_1.elapsed)(webVitalTime, computationTime)),
                hasNode: !!webVitalNode,
                replayRecording: recorderApi.isRecording(),
                replaySampled: (_a = session.findTrackedSession()) === null || _a === void 0 ? void 0 : _a.sessionReplayAllowed,
                serializedDomNode: webVitalNode ? recorderApi.getSerializedNodeId(webVitalNode) : undefined,
            });
        },
    };
}
exports.startWebVitalTelemetryDebug = startWebVitalTelemetryDebug;
//# sourceMappingURL=startWebVitalTelemetryDebug.js.map