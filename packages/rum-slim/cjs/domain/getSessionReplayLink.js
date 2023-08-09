"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionReplayLink = void 0;
var browser_rum_core_1 = require("@datadog/browser-rum-core");
function getSessionReplayLink(configuration) {
    return (0, browser_rum_core_1.getSessionReplayUrl)(configuration, { errorType: 'slim-package' });
}
exports.getSessionReplayLink = getSessionReplayLink;
//# sourceMappingURL=getSessionReplayLink.js.map