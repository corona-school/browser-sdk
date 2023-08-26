"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getType = void 0;
/**
 * Similar to `typeof`, but distinguish plain objects from `null` and arrays
 */
function getType(value) {
    if (value === null) {
        return 'null';
    }
    if (Array.isArray(value)) {
        return 'array';
    }
    return typeof value;
}
exports.getType = getType;
//# sourceMappingURL=typeUtils.js.map