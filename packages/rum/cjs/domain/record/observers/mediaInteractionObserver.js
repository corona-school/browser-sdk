"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMediaInteractionObserver = void 0;
var browser_core_1 = require("@datadog/browser-core");
var constants_1 = require("../../../constants");
var types_1 = require("../../../types");
var eventsUtils_1 = require("../eventsUtils");
var privacy_1 = require("../privacy");
var serialization_1 = require("../serialization");
function initMediaInteractionObserver(configuration, mediaInteractionCb, defaultPrivacyLevel) {
    return (0, browser_core_1.addEventListeners)(configuration, document, ["play" /* DOM_EVENT.PLAY */, "pause" /* DOM_EVENT.PAUSE */], function (event) {
        var target = (0, eventsUtils_1.getEventTarget)(event);
        if (!target ||
            (0, privacy_1.getNodePrivacyLevel)(target, defaultPrivacyLevel) === constants_1.NodePrivacyLevel.HIDDEN ||
            !(0, serialization_1.hasSerializedNode)(target)) {
            return;
        }
        mediaInteractionCb({
            id: (0, serialization_1.getSerializedNodeId)(target),
            type: event.type === "play" /* DOM_EVENT.PLAY */ ? types_1.MediaInteractionType.Play : types_1.MediaInteractionType.Pause,
        });
    }, {
        capture: true,
        passive: true,
    }).stop;
}
exports.initMediaInteractionObserver = initMediaInteractionObserver;
//# sourceMappingURL=mediaInteractionObserver.js.map