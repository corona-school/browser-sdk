import { addEventListeners, addTelemetryDebug, throttle } from '@datadog/browser-core';
import { getSerializedNodeId, hasSerializedNode } from '../serialization';
import { IncrementalSource } from '../../../types';
import { getEventTarget, isTouchEvent } from '../eventsUtils';
import { convertMouseEventToLayoutCoordinates } from '../viewports';
var MOUSE_MOVE_OBSERVER_THRESHOLD = 50;
export function initMoveObserver(configuration, cb) {
    var updatePosition = throttle(function (event) {
        var target = getEventTarget(event);
        if (hasSerializedNode(target)) {
            var coordinates = tryToComputeCoordinates(event);
            if (!coordinates) {
                return;
            }
            var position = {
                id: getSerializedNodeId(target),
                timeOffset: 0,
                x: coordinates.x,
                y: coordinates.y,
            };
            cb([position], isTouchEvent(event) ? IncrementalSource.TouchMove : IncrementalSource.MouseMove);
        }
    }, MOUSE_MOVE_OBSERVER_THRESHOLD, {
        trailing: false,
    }).throttled;
    return addEventListeners(configuration, document, ["mousemove" /* DOM_EVENT.MOUSE_MOVE */, "touchmove" /* DOM_EVENT.TOUCH_MOVE */], updatePosition, {
        capture: true,
        passive: true,
    }).stop;
}
export function tryToComputeCoordinates(event) {
    var _a = isTouchEvent(event) ? event.changedTouches[0] : event, x = _a.clientX, y = _a.clientY;
    if (window.visualViewport) {
        var _b = convertMouseEventToLayoutCoordinates(x, y), visualViewportX = _b.visualViewportX, visualViewportY = _b.visualViewportY;
        x = visualViewportX;
        y = visualViewportY;
    }
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
        if (event.isTrusted) {
            addTelemetryDebug('mouse/touch event without x/y');
        }
        return undefined;
    }
    return { x: x, y: y };
}
//# sourceMappingURL=moveObserver.js.map