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
export function initObservers(configuration, o) {
    var recordIds = initRecordIds();
    var mutationHandler = initMutationObserver(o.mutationCb, o.configuration, o.shadowRootsController, document);
    var mousemoveHandler = initMoveObserver(configuration, o.mousemoveCb);
    var mouseInteractionHandler = initMouseInteractionObserver(configuration, o.mouseInteractionCb, recordIds);
    var scrollHandler = initScrollObserver(configuration, o.scrollCb, o.configuration.defaultPrivacyLevel, o.elementsScrollPositions);
    var viewportResizeHandler = initViewportResizeObserver(configuration, o.viewportResizeCb);
    var inputHandler = initInputObserver(configuration, o.inputCb);
    var mediaInteractionHandler = initMediaInteractionObserver(configuration, o.mediaInteractionCb, o.configuration.defaultPrivacyLevel);
    var styleSheetObserver = initStyleSheetObserver(o.styleSheetCb);
    var focusHandler = initFocusObserver(configuration, o.focusCb);
    var visualViewportResizeHandler = initVisualViewportResizeObserver(configuration, o.visualViewportResizeCb);
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