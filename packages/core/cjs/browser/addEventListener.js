"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEventListeners = exports.addEventListener = void 0;
var monitor_1 = require("../tools/monitor");
var getZoneJsOriginalValue_1 = require("../tools/getZoneJsOriginalValue");
/**
 * Add an event listener to an event target object (Window, Element, mock object...).  This provides
 * a few conveniences compared to using `element.addEventListener` directly:
 *
 * * supports IE11 by: using an option object only if needed and emulating the `once` option
 *
 * * wraps the listener with a `monitor` function
 *
 * * returns a `stop` function to remove the listener
 */
function addEventListener(configuration, eventTarget, eventName, listener, options) {
    return addEventListeners(configuration, eventTarget, [eventName], listener, options);
}
exports.addEventListener = addEventListener;
/**
 * Add event listeners to an event target object (Window, Element, mock object...).  This provides
 * a few conveniences compared to using `element.addEventListener` directly:
 *
 * * supports IE11 by: using an option object only if needed and emulating the `once` option
 *
 * * wraps the listener with a `monitor` function
 *
 * * returns a `stop` function to remove the listener
 *
 * * with `once: true`, the listener will be called at most once, even if different events are listened
 */
function addEventListeners(_, eventTarget, eventNames, listener, _a) {
    var _b = _a === void 0 ? {} : _a, once = _b.once, capture = _b.capture, passive = _b.passive;
    var listenerWithMonitor = (0, monitor_1.monitor)(once
        ? function (event) {
            stop();
            listener(event);
        }
        : listener);
    var options = passive ? { capture: capture, passive: passive } : capture;
    var add = (0, getZoneJsOriginalValue_1.getZoneJsOriginalValue)(eventTarget, 'addEventListener');
    eventNames.forEach(function (eventName) { return add.call(eventTarget, eventName, listenerWithMonitor, options); });
    function stop() {
        var remove = (0, getZoneJsOriginalValue_1.getZoneJsOriginalValue)(eventTarget, 'removeEventListener');
        eventNames.forEach(function (eventName) { return remove.call(eventTarget, eventName, listenerWithMonitor, options); });
    }
    return {
        stop: stop,
    };
}
exports.addEventListeners = addEventListeners;
//# sourceMappingURL=addEventListener.js.map