"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenActionEvents = void 0;
var browser_core_1 = require("@datadog/browser-core");
function listenActionEvents(configuration, _a) {
    var onPointerDown = _a.onPointerDown, onPointerUp = _a.onPointerUp;
    var selectionEmptyAtPointerDown;
    var userActivity = {
        selection: false,
        input: false,
    };
    var clickContext;
    var listeners = [
        (0, browser_core_1.addEventListener)(configuration, window, "pointerdown" /* DOM_EVENT.POINTER_DOWN */, function (event) {
            if (isValidPointerEvent(event)) {
                selectionEmptyAtPointerDown = isSelectionEmpty();
                userActivity = {
                    selection: false,
                    input: false,
                };
                clickContext = onPointerDown(event);
            }
        }, { capture: true }),
        (0, browser_core_1.addEventListener)(configuration, window, "selectionchange" /* DOM_EVENT.SELECTION_CHANGE */, function () {
            if (!selectionEmptyAtPointerDown || !isSelectionEmpty()) {
                userActivity.selection = true;
            }
        }, { capture: true }),
        (0, browser_core_1.addEventListener)(configuration, window, "pointerup" /* DOM_EVENT.POINTER_UP */, function (event) {
            if (isValidPointerEvent(event) && clickContext) {
                // Use a scoped variable to make sure the value is not changed by other clicks
                var localUserActivity_1 = userActivity;
                onPointerUp(clickContext, event, function () { return localUserActivity_1; });
                clickContext = undefined;
            }
        }, { capture: true }),
        (0, browser_core_1.addEventListener)(configuration, window, "input" /* DOM_EVENT.INPUT */, function () {
            userActivity.input = true;
        }, { capture: true }),
    ];
    return {
        stop: function () {
            listeners.forEach(function (listener) { return listener.stop(); });
        },
    };
}
exports.listenActionEvents = listenActionEvents;
function isSelectionEmpty() {
    var selection = window.getSelection();
    return !selection || selection.isCollapsed;
}
function isValidPointerEvent(event) {
    return (event.target instanceof Element &&
        // Only consider 'primary' pointer events for now. Multi-touch support could be implemented in
        // the future.
        event.isPrimary !== false);
}
//# sourceMappingURL=listenActionEvents.js.map