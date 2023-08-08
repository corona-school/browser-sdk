"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeTruncate = exports.findCommaSeparatedValue = exports.generateUUID = void 0;
/**
 * UUID v4
 * from https://gist.github.com/jed/982883
 */
function generateUUID(placeholder) {
    return placeholder
        ? // eslint-disable-next-line  no-bitwise
            (parseInt(placeholder, 10) ^ ((Math.random() * 16) >> (parseInt(placeholder, 10) / 4))).toString(16)
        : "".concat(1e7, "-").concat(1e3, "-").concat(4e3, "-").concat(8e3, "-").concat(1e11).replace(/[018]/g, generateUUID);
}
exports.generateUUID = generateUUID;
function findCommaSeparatedValue(rawString, name) {
    var regex = new RegExp("(?:^|;)\\s*".concat(name, "\\s*=\\s*([^;]+)"));
    var matches = regex.exec(rawString);
    return matches ? matches[1] : undefined;
}
exports.findCommaSeparatedValue = findCommaSeparatedValue;
function safeTruncate(candidate, length, suffix) {
    if (suffix === void 0) { suffix = ''; }
    var lastChar = candidate.charCodeAt(length - 1);
    var isLastCharSurrogatePair = lastChar >= 0xd800 && lastChar <= 0xdbff;
    var correctedLength = isLastCharSurrogatePair ? length + 1 : length;
    if (candidate.length <= correctedLength) {
        return candidate;
    }
    return "".concat(candidate.slice(0, correctedLength)).concat(suffix);
}
exports.safeTruncate = safeTruncate;
//# sourceMappingURL=stringUtils.js.map