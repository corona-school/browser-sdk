"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventTarget = exports.isTouchEvent = void 0;
var browser_rum_core_1 = require("@datadog/browser-rum-core");
function isTouchEvent(event) {
    return Boolean(event.changedTouches);
}
exports.isTouchEvent = isTouchEvent;
function getEventTarget(event) {
    if (event.composed === true && (0, browser_rum_core_1.isNodeShadowHost)(event.target)) {
        return event.composedPath()[0];
    }
    return event.target;
}
exports.getEventTarget = getEventTarget;
//# sourceMappingURL=eventsUtils.js.map