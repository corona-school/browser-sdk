import { throttle, addEventListener } from '@datadog/browser-core';
import { getScrollX, getScrollY } from '@datadog/browser-rum-core';
import { getEventTarget } from '../eventsUtils';
import { getNodePrivacyLevel } from '../privacy';
import { getSerializedNodeId, hasSerializedNode } from '../serialization';
import { NodePrivacyLevel } from '../../../constants';
var SCROLL_OBSERVER_THRESHOLD = 100;
export function initScrollObserver(configuration, cb, defaultPrivacyLevel, elementsScrollPositions) {
    var updatePosition = throttle(function (event) {
        var target = getEventTarget(event);
        if (!target ||
            getNodePrivacyLevel(target, defaultPrivacyLevel) === NodePrivacyLevel.HIDDEN ||
            !hasSerializedNode(target)) {
            return;
        }
        var id = getSerializedNodeId(target);
        var scrollPositions = target === document
            ? {
                scrollTop: getScrollY(),
                scrollLeft: getScrollX(),
            }
            : {
                scrollTop: Math.round(target.scrollTop),
                scrollLeft: Math.round(target.scrollLeft),
            };
        elementsScrollPositions.set(target, scrollPositions);
        cb({
            id: id,
            x: scrollPositions.scrollLeft,
            y: scrollPositions.scrollTop,
        });
    }, SCROLL_OBSERVER_THRESHOLD).throttled;
    return addEventListener(configuration, document, "scroll" /* DOM_EVENT.SCROLL */, updatePosition, { capture: true, passive: true })
        .stop;
}
//# sourceMappingURL=scrollObserver.js.map