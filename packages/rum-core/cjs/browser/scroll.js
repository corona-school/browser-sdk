"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScrollY = exports.getScrollX = void 0;
function getScrollX() {
    var scrollX;
    var visual = window.visualViewport;
    if (visual) {
        scrollX = visual.pageLeft - visual.offsetLeft;
    }
    else if (window.scrollX !== undefined) {
        scrollX = window.scrollX;
    }
    else {
        scrollX = window.pageXOffset || 0;
    }
    return Math.round(scrollX);
}
exports.getScrollX = getScrollX;
function getScrollY() {
    var scrollY;
    var visual = window.visualViewport;
    if (visual) {
        scrollY = visual.pageTop - visual.offsetTop;
    }
    else if (window.scrollY !== undefined) {
        scrollY = window.scrollY;
    }
    else {
        scrollY = window.pageYOffset || 0;
    }
    return Math.round(scrollY);
}
exports.getScrollY = getScrollY;
//# sourceMappingURL=scroll.js.map