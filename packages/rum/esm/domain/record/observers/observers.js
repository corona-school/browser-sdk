import { initMoveObserver } from './moveObserver';
import { initScrollObserver } from './scrollObserver';
import { initMouseInteractionObserver } from './mouseInteractionObserver';
import { initInputObserver } from './inputObserver';
import { initStyleSheetObserver } from './styleSheetObserver';
import { initMediaInteractionObserver } from './mediaInteractionObserver';
import { initFrustrationObserver } from './frustrationObserver';
import { initViewportResizeObserver, initVisualViewportResizeObserver } from './viewportResizeObserver';
import { initMutationObserver } from './mutationObserver';
import { initFocusObserver } from './focusObserver';
import { initRecordIds } from './recordIds';
export function initObservers(o) {
    var recordIds = initRecordIds();
    var mutationHandler = initMutationObserver(o.mutationCb, o.configuration, o.shadowRootsController, document);
    var mousemoveHandler = initMoveObserver(o.mousemoveCb);
    var mouseInteractionHandler = initMouseInteractionObserver(o.mouseInteractionCb, o.configuration.defaultPrivacyLevel, recordIds);
    var scrollHandler = initScrollObserver(o.scrollCb, o.configuration.defaultPrivacyLevel, o.elementsScrollPositions);
    var viewportResizeHandler = initViewportResizeObserver(o.viewportResizeCb);
    var inputHandler = initInputObserver(o.inputCb, o.configuration.defaultPrivacyLevel);
    var mediaInteractionHandler = initMediaInteractionObserver(o.mediaInteractionCb, o.configuration.defaultPrivacyLevel);
    var styleSheetObserver = initStyleSheetObserver(o.styleSheetCb);
    var focusHandler = initFocusObserver(o.focusCb);
    var visualViewportResizeHandler = initVisualViewportResizeObserver(o.visualViewportResizeCb);
    var frustrationHandler = initFrustrationObserver(o.lifeCycle, o.frustrationCb, recordIds);
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
//# sourceMappingURL=observers.js.map