"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionReplayLink = getSessionReplayLink;
var browser_rum_core_1 = require("@datadog/browser-rum-core");
function getSessionReplayLink(configuration) {
    return (0, browser_rum_core_1.getSessionReplayUrl)(configuration, { errorType: 'slim-package' });
}
//# sourceMappingURL=getSessionReplayLink.js.map