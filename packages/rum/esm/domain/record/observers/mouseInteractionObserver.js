var _a;
import { assign, addEventListeners } from '@datadog/browser-core';
import { NodePrivacyLevel } from '../../../constants';
import { IncrementalSource, MouseInteractionType } from '../../../types';
import { assembleIncrementalSnapshot } from '../assembly';
import { getEventTarget } from '../eventsUtils';
import { getNodePrivacyLevel } from '../privacy';
import { getSerializedNodeId, hasSerializedNode } from '../serialization';
import { tryToComputeCoordinates } from './moveObserver';
var eventTypeToMouseInteraction = (_a = {},
    // Listen for pointerup DOM events instead of mouseup for MouseInteraction/MouseUp records. This
    // allows to reference such records from Frustration records.
    //
    // In the context of supporting Mobile Session Replay, we introduced `PointerInteraction` records
    // used by the Mobile SDKs in place of `MouseInteraction`. In the future, we should replace
    // `MouseInteraction` by `PointerInteraction` in the Browser SDK so we have an uniform way to
    // convey such interaction. This would cleanly solve the issue since we would have
    // `PointerInteraction/Up` records that we could reference from `Frustration` records.
    _a["pointerup" /* DOM_EVENT.POINTER_UP */] = MouseInteractionType.MouseUp,
    _a["mousedown" /* DOM_EVENT.MOUSE_DOWN */] = MouseInteractionType.MouseDown,
    _a["click" /* DOM_EVENT.CLICK */] = MouseInteractionType.Click,
    _a["contextmenu" /* DOM_EVENT.CONTEXT_MENU */] = MouseInteractionType.ContextMenu,
    _a["dblclick" /* DOM_EVENT.DBL_CLICK */] = MouseInteractionType.DblClick,
    _a["focus" /* DOM_EVENT.FOCUS */] = MouseInteractionType.Focus,
    _a["blur" /* DOM_EVENT.BLUR */] = MouseInteractionType.Blur,
    _a["touchstart" /* DOM_EVENT.TOUCH_START */] = MouseInteractionType.TouchStart,
    _a["touchend" /* DOM_EVENT.TOUCH_END */] = MouseInteractionType.TouchEnd,
    _a);
export function initMouseInteractionObserver(configuration, cb, recordIds) {
    var handler = function (event) {
        var target = getEventTarget(event);
        if (getNodePrivacyLevel(target, configuration.defaultPrivacyLevel) === NodePrivacyLevel.HIDDEN ||
            !hasSerializedNode(target)) {
            return;
        }
        var id = getSerializedNodeId(target);
        var type = eventTypeToMouseInteraction[event.type];
        var interaction;
        if (type !== MouseInteractionType.Blur && type !== MouseInteractionType.Focus) {
            var coordinates = tryToComputeCoordinates(event);
            if (!coordinates) {
                return;
            }
            interaction = { id: id, type: type, x: coordinates.x, y: coordinates.y };
        }
        else {
            interaction = { id: id, type: type };
        }
        var record = assign({ id: recordIds.getIdForEvent(event) }, assembleIncrementalSnapshot(IncrementalSource.MouseInteraction, interaction));
        cb(record);
    };
    return addEventListeners(configuration, document, Object.keys(eventTypeToMouseInteraction), handler, {
        capture: true,
        passive: true,
    }).stop;
}
//# sourceMappingURL=mouseInteractionObserver.js.map