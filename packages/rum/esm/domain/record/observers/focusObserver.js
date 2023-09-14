import { addEventListeners } from '@datadog/browser-core';
export function initFocusObserver(configuration, focusCb) {
    return addEventListeners(configuration, window, ["focus" /* DOM_EVENT.FOCUS */, "blur" /* DOM_EVENT.BLUR */], function () {
        focusCb({ has_focus: document.hasFocus() });
    }).stop;
}
//# sourceMappingURL=focusObserver.js.map