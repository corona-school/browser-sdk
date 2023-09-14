import { addEventListeners } from '@datadog/browser-core';
import { NodePrivacyLevel } from '../../../constants';
import { MediaInteractionType } from '../../../types';
import { getEventTarget } from '../eventsUtils';
import { getNodePrivacyLevel } from '../privacy';
import { getSerializedNodeId, hasSerializedNode } from '../serialization';
export function initMediaInteractionObserver(configuration, mediaInteractionCb, defaultPrivacyLevel) {
    return addEventListeners(configuration, document, ["play" /* DOM_EVENT.PLAY */, "pause" /* DOM_EVENT.PAUSE */], function (event) {
        var target = getEventTarget(event);
        if (!target ||
            getNodePrivacyLevel(target, defaultPrivacyLevel) === NodePrivacyLevel.HIDDEN ||
            !hasSerializedNode(target)) {
            return;
        }
        mediaInteractionCb({
            id: getSerializedNodeId(target),
            type: event.type === "play" /* DOM_EVENT.PLAY */ ? MediaInteractionType.Play : MediaInteractionType.Pause,
        });
    }, {
        capture: true,
        passive: true,
    }).stop;
}
//# sourceMappingURL=mediaInteractionObserver.js.map