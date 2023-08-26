"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.datadogRum = exports.DefaultPrivacyLevel = void 0;
var browser_core_1 = require("@datadog/browser-core");
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var getSessionReplayLink_1 = require("../domain/getSessionReplayLink");
var browser_core_2 = require("@datadog/browser-core");
Object.defineProperty(exports, "DefaultPrivacyLevel", { enumerable: true, get: function () { return browser_core_2.DefaultPrivacyLevel; } });
exports.datadogRum = (0, browser_rum_core_1.makeRumPublicApi)(browser_rum_core_1.startRum, {
    start: browser_core_1.noop,
    stop: browser_core_1.noop,
    onRumStart: browser_core_1.noop,
    isRecording: function () { return false; },
    getReplayStats: function () { return undefined; },
    getSessionReplayLink: getSessionReplayLink_1.getSessionReplayLink,
    getSerializedNodeId: function () { return undefined; },
    recorderStartObservable: new browser_core_1.Observable(),
});
(0, browser_core_1.defineGlobal)((0, browser_core_1.getGlobalObject)(), 'DD_RUM', exports.datadogRum);
//# sourceMappingURL=main.js.map