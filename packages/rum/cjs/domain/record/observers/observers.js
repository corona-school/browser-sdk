"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initObservers = void 0;
var moveObserver_1 = require("./moveObserver");
var scrollObserver_1 = require("./scrollObserver");
var mouseInteractionObserver_1 = require("./mouseInteractionObserver");
var inputObserver_1 = require("./inputObserver");
var styleSheetObserver_1 = require("./styleSheetObserver");
var mediaInteractionObserver_1 = require("./mediaInteractionObserver");
var frustrationObserver_1 = require("./frustrationObserver");
var viewportResizeObserver_1 = require("./viewportResizeObserver");
var mutationObserver_1 = require("./mutationObserver");
var focusObserver_1 = require("./focusObserver");
var recordIds_1 = require("./recordIds");
function initObservers(configuration, o) {
    var recordIds = (0, recordIds_1.initRecordIds)();
    var mutationHandler = (0, mutationObserver_1.initMutationObserver)(o.mutationCb, o.configuration, o.shadowRootsController, document);
    var mousemoveHandler = (0, moveObserver_1.initMoveObserver)(configuration, o.mousemoveCb);
    var mouseInteractionHandler = (0, mouseInteractionObserver_1.initMouseInteractionObserver)(configuration, o.mouseInteractionCb, recordIds);
    var scrollHandler = (0, scrollObserver_1.initScrollObserver)(configuration, o.scrollCb, o.configuration.defaultPrivacyLevel, o.elementsScrollPositions);
    var viewportResizeHandler = (0, viewportResizeObserver_1.initViewportResizeObserver)(configuration, o.viewportResizeCb);
    var inputHandler = (0, inputObserver_1.initInputObserver)(configuration, o.inputCb);
    var mediaInteractionHandler = (0, mediaInteractionObserver_1.initMediaInteractionObserver)(configuration, o.mediaInteractionCb, o.configuration.defaultPrivacyLevel);
    var styleSheetObserver = (0, styleSheetObserver_1.initStyleSheetObserver)(o.styleSheetCb);
    var focusHandler = (0, focusObserver_1.initFocusObserver)(configuration, o.focusCb);
    var visualViewportResizeHandler = (0, viewportResizeObserver_1.initVisualViewportResizeObserver)(configuration, o.visualViewportResizeCb);
    var frustrationHandler = (0, frustrationObserver_1.initFrustrationObserver)(o.lifeCycle, o.frustrationCb, recordIds);
    return {
        flush: function () {
            mutationHandler.flush();
        },
        stop: function () {
            mutationHandler.stop();
            mousemoveHandler();
            mouseInteractionHandler();
            scrollHandler();
            viewportResizeHandler();
            inputHandler();
            mediaInteractionHandler();
            styleSheetObserver();
            focusHandler();
            visualViewportResizeHandler();
            frustrationHandler();
        },
    };
}
exports.initObservers = initObservers;
//# sourceMappingURL=observers.js.map