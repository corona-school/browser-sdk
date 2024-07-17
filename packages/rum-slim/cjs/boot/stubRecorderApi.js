"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRecorderApiStub = makeRecorderApiStub;
var browser_core_1 = require("@datadog/browser-core");
var getSessionReplayLink_1 = require("../domain/getSessionReplayLink");
function makeRecorderApiStub() {
    var getSessionReplayLinkStrategy = browser_core_1.noop;
    return {
        start: browser_core_1.noop,
        stop: browser_core_1.noop,
        onRumStart: function (_lifeCycle, configuration) {
            getSessionReplayLinkStrategy = function () { return (0, getSessionReplayLink_1.getSessionReplayLink)(configuration); };
        },
        isRecording: function () { return false; },
        getReplayStats: function () { return undefined; },
        getSessionReplayLink: function () { return getSessionReplayLinkStrategy(); },
    };
}
//# sourceMappingURL=stubRecorderApi.js.map