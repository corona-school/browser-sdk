"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearInterval = exports.setInterval = exports.clearTimeout = exports.setTimeout = void 0;
var getZoneJsOriginalValue_1 = require("./getZoneJsOriginalValue");
var monitor_1 = require("./monitor");
var getGlobalObject_1 = require("./getGlobalObject");
function setTimeout(callback, delay) {
    return (0, getZoneJsOriginalValue_1.getZoneJsOriginalValue)((0, getGlobalObject_1.getGlobalObject)(), 'setTimeout')((0, monitor_1.monitor)(callback), delay);
}
exports.setTimeout = setTimeout;
function clearTimeout(timeoutId) {
    (0, getZoneJsOriginalValue_1.getZoneJsOriginalValue)((0, getGlobalObject_1.getGlobalObject)(), 'clearTimeout')(timeoutId);
}
exports.clearTimeout = clearTimeout;
function setInterval(callback, delay) {
    return (0, getZoneJsOriginalValue_1.getZoneJsOriginalValue)((0, getGlobalObject_1.getGlobalObject)(), 'setInterval')((0, monitor_1.monitor)(callback), delay);
}
exports.setInterval = setInterval;
function clearInterval(timeoutId) {
    (0, getZoneJsOriginalValue_1.getZoneJsOriginalValue)((0, getGlobalObject_1.getGlobalObject)(), 'clearInterval')(timeoutId);
}
exports.clearInterval = clearInterval;
//# sourceMappingURL=timer.js.map