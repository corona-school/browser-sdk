"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNumber = exports.isPercentage = exports.round = exports.performDraw = void 0;
/**
 * Return true if the draw is successful
 * @param threshold between 0 and 100
 */
function performDraw(threshold) {
    return threshold !== 0 && Math.random() * 100 <= threshold;
}
exports.performDraw = performDraw;
function round(num, decimals) {
    return +num.toFixed(decimals);
}
exports.round = round;
function isPercentage(value) {
    return isNumber(value) && value >= 0 && value <= 100;
}
exports.isPercentage = isPercentage;
function isNumber(value) {
    return typeof value === 'number';
}
exports.isNumber = isNumber;
//# sourceMappingURL=numberUtils.js.map