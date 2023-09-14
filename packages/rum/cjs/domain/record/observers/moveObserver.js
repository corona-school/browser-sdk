"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryToComputeCoordinates = exports.initMoveObserver = void 0;
var browser_core_1 = require("@datadog/browser-core");
var serialization_1 = require("../serialization");
var types_1 = require("../../../types");
var eventsUtils_1 = require("../eventsUtils");
var viewports_1 = require("../viewports");
var MOUSE_MOVE_OBSERVER_THRESHOLD = 50;
function initMoveObserver(configuration, cb) {
    var updatePosition = (0, browser_core_1.throttle)(function (event) {
        var target = (0, eventsUtils_1.getEventTarget)(event);
        if ((0, serialization_1.hasSerializedNode)(target)) {
            var coordinates = tryToComputeCoordinates(event);
            if (!coordinates) {
                return;
            }
            var position = {
                id: (0, serialization_1.getSerializedNodeId)(target),
                timeOffset: 0,
                x: coordinates.x,
                y: coordinates.y,
            };
            cb([position], (0, eventsUtils_1.isTouchEvent)(event) ? types_1.IncrementalSource.TouchMove : types_1.IncrementalSource.MouseMove);
        }
    }, MOUSE_MOVE_OBSERVER_THRESHOLD, {
        trailing: false,
    }).throttled;
    return (0, browser_core_1.addEventListeners)(configuration, document, ["mousemove" /* DOM_EVENT.MOUSE_MOVE */, "touchmove" /* DOM_EVENT.TOUCH_MOVE */], updatePosition, {
        capture: true,
        passive: true,
    }).stop;
}
exports.initMoveObserver = initMoveObserver;
function tryToComputeCoordinates(event) {
    var _a = (0, eventsUtils_1.isTouchEvent)(event) ? event.changedTouches[0] : event, x = _a.clientX, y = _a.clientY;
    if (window.visualViewport) {
        var _b = (0, viewports_1.convertMouseEventToLayoutCoordinates)(x, y), visualViewportX = _b.visualViewportX, visualViewportY = _b.visualViewportY;
        x = visualViewportX;
        y = visualViewportY;
    }
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
        if (event.isTrusted) {
            (0, browser_core_1.addTelemetryDebug)('mouse/touch event without x/y');
        }
        return undefined;
    }
    return { x: x, y: y };
}
exports.tryToComputeCoordinates = tryToComputeCoordinates;
//# sourceMappingURL=moveObserver.js.map