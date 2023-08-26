import { isExperimentalFeatureEnabled, ExperimentalFeature } from '../tools/experimentalFeatures';
import { Observable } from '../tools/observable';
import { objectValues, includes } from '../tools/utils/polyfills';
import { noop } from '../tools/utils/functionUtils';
import { addEventListeners, addEventListener } from './addEventListener';
export var PageExitReason = {
    HIDDEN: 'visibility_hidden',
    UNLOADING: 'before_unload',
    PAGEHIDE: 'page_hide',
    FROZEN: 'page_frozen',
};
export function createPageExitObservable(configuration) {
    var observable = new Observable(function () {
        var pagehideEnabled = isExperimentalFeatureEnabled(ExperimentalFeature.PAGEHIDE);
        var stopListeners = addEventListeners(configuration, window, ["visibilitychange" /* DOM_EVENT.VISIBILITY_CHANGE */, "freeze" /* DOM_EVENT.FREEZE */, "pagehide" /* DOM_EVENT.PAGE_HIDE */], function (event) {
            if (event.type === "pagehide" /* DOM_EVENT.PAGE_HIDE */ && pagehideEnabled) {
                /**
                 * Only event that detect page unload events while being compatible with the back/forward cache (bfcache)
                 */
                observable.notify({ reason: PageExitReason.PAGEHIDE });
            }
            else if (event.type === "visibilitychange" /* DOM_EVENT.VISIBILITY_CHANGE */ && document.visibilityState === 'hidden') {
                /**
                 * Only event that guarantee to fire on mobile devices when the page transitions to background state
                 * (e.g. when user switches to a different application, goes to homescreen, etc), or is being unloaded.
                 */
                observable.notify({ reason: PageExitReason.HIDDEN });
            }
            else if (event.type === "freeze" /* DOM_EVENT.FREEZE */) {
                /**
                 * After transitioning in background a tab can be freezed to preserve resources. (cf: https://developer.chrome.com/blog/page-lifecycle-api)
                 * Allow to collect events happening between hidden and frozen state.
                 */
                observable.notify({ reason: PageExitReason.FROZEN });
            }
        }, { capture: true }).stop;
        var stopBeforeUnloadListener = noop;
        if (!pagehideEnabled) {
            stopBeforeUnloadListener = addEventListener(configuration, window, "beforeunload" /* DOM_EVENT.BEFORE_UNLOAD */, function () {
                observable.notify({ reason: PageExitReason.UNLOADING });
            }).stop;
        }
        return function () {
            stopListeners();
            stopBeforeUnloadListener();
        };
    });
    return observable;
}
export function isPageExitReason(reason) {
    return includes(objectValues(PageExitReason), reason);
}
//# sourceMappingURL=pageExitObservable.js.map