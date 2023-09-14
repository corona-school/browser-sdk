"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initScrollObserver = void 0;
var browser_core_1 = require("@datadog/browser-core");
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var eventsUtils_1 = require("../eventsUtils");
var privacy_1 = require("../privacy");
var serialization_1 = require("../serialization");
var constants_1 = require("../../../constants");
var SCROLL_OBSERVER_THRESHOLD = 100;
function initScrollObserver(configuration, cb, defaultPrivacyLevel, elementsScrollPositions) {
    var updatePosition = (0, browser_core_1.throttle)(function (event) {
        var target = (0, eventsUtils_1.getEventTarget)(event);
        if (!target ||
            (0, privacy_1.getNodePrivacyLevel)(target, defaultPrivacyLevel) === constants_1.NodePrivacyLevel.HIDDEN ||
            !(0, serialization_1.hasSerializedNode)(target)) {
            return;
        }
        var id = (0, serialization_1.getSerializedNodeId)(target);
        var scrollPositions = target === document
            ? {
                scrollTop: (0, browser_rum_core_1.getScrollY)(),
                scrollLeft: (0, browser_rum_core_1.getScrollX)(),
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
    return (0, browser_core_1.addEventListener)(configuration, document, "scroll" /* DOM_EVENT.SCROLL */, updatePosition, { capture: true, passive: true })
        .stop;
}
exports.initScrollObserver = initScrollObserver;
//# sourceMappingURL=scrollObserver.js.map