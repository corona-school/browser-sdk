"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initFocusObserver = void 0;
var browser_core_1 = require("@datadog/browser-core");
function initFocusObserver(configuration, focusCb) {
    return (0, browser_core_1.addEventListeners)(configuration, window, ["focus" /* DOM_EVENT.FOCUS */, "blur" /* DOM_EVENT.BLUR */], function () {
        focusCb({ has_focus: document.hasFocus() });
    }).stop;
}
exports.initFocusObserver = initFocusObserver;
//# sourceMappingURL=focusObserver.js.map