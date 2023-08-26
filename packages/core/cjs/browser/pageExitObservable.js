"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPageExitReason = exports.createPageExitObservable = exports.PageExitReason = void 0;
var experimentalFeatures_1 = require("../tools/experimentalFeatures");
var observable_1 = require("../tools/observable");
var polyfills_1 = require("../tools/utils/polyfills");
var functionUtils_1 = require("../tools/utils/functionUtils");
var addEventListener_1 = require("./addEventListener");
exports.PageExitReason = {
    HIDDEN: 'visibility_hidden',
    UNLOADING: 'before_unload',
    PAGEHIDE: 'page_hide',
    FROZEN: 'page_frozen',
};
function createPageExitObservable(configuration) {
    var observable = new observable_1.Observable(function () {
        var pagehideEnabled = (0, experimentalFeatures_1.isExperimentalFeatureEnabled)(experimentalFeatures_1.ExperimentalFeature.PAGEHIDE);
        var stopListeners = (0, addEventListener_1.addEventListeners)(configuration, window, ["visibilitychange" /* DOM_EVENT.VISIBILITY_CHANGE */, "freeze" /* DOM_EVENT.FREEZE */, "pagehide" /* DOM_EVENT.PAGE_HIDE */], function (event) {
            if (event.type === "pagehide" /* DOM_EVENT.PAGE_HIDE */ && pagehideEnabled) {
                /**
                 * Only event that detect page unload events while being compatible with the back/forward cache (bfcache)
                 */
                observable.notify({ reason: exports.PageExitReason.PAGEHIDE });
            }
            else if (event.type === "visibilitychange" /* DOM_EVENT.VISIBILITY_CHANGE */ && document.visibilityState === 'hidden') {
                /**
                 * Only event that guarantee to fire on mobile devices when the page transitions to background state
                 * (e.g. when user switches to a different application, goes to homescreen, etc), or is being unloaded.
                 */
                observable.notify({ reason: exports.PageExitReason.HIDDEN });
            }
            else if (event.type === "freeze" /* DOM_EVENT.FREEZE */) {
                /**
                 * After transitioning in background a tab can be freezed to preserve resources. (cf: https://developer.chrome.com/blog/page-lifecycle-api)
                 * Allow to collect events happening between hidden and frozen state.
                 */
                observable.notify({ reason: exports.PageExitReason.FROZEN });
            }
        }, { capture: true }).stop;
        var stopBeforeUnloadListener = functionUtils_1.noop;
        if (!pagehideEnabled) {
            stopBeforeUnloadListener = (0, addEventListener_1.addEventListener)(configuration, window, "beforeunload" /* DOM_EVENT.BEFORE_UNLOAD */, function () {
                observable.notify({ reason: exports.PageExitReason.UNLOADING });
            }).stop;
        }
        return function () {
            stopListeners();
            stopBeforeUnloadListener();
        };
    });
    return observable;
}
exports.createPageExitObservable = createPageExitObservable;
function isPageExitReason(reason) {
    return (0, polyfills_1.includes)((0, polyfills_1.objectValues)(exports.PageExitReason), reason);
}
exports.isPageExitReason = isPageExitReason;
//# sourceMappingURL=pageExitObservable.js.map