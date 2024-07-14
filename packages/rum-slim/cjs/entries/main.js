"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.datadogRum = exports.DefaultPrivacyLevel = void 0;
// Keep the following in sync with packages/rum/src/entries/main.ts
var browser_core_1 = require("@datadog/browser-core");
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var stubRecorderApi_1 = require("../boot/stubRecorderApi");
var browser_core_2 = require("@datadog/browser-core");
Object.defineProperty(exports, "DefaultPrivacyLevel", { enumerable: true, get: function () { return browser_core_2.DefaultPrivacyLevel; } });
exports.datadogRum = (0, browser_rum_core_1.makeRumPublicApi)(browser_rum_core_1.startRum, (0, stubRecorderApi_1.makeRecorderApiStub)());
(0, browser_core_1.defineGlobal)((0, browser_core_1.getGlobalObject)(), 'DD_RUM', exports.datadogRum);
//# sourceMappingURL=main.js.map