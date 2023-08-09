"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapValues = exports.isEmptyObject = exports.objectHasValue = exports.shallowClone = void 0;
var polyfills_1 = require("./polyfills");
function shallowClone(object) {
    return (0, polyfills_1.assign)({}, object);
}
exports.shallowClone = shallowClone;
function objectHasValue(object, value) {
    return Object.keys(object).some(function (key) { return object[key] === value; });
}
exports.objectHasValue = objectHasValue;
function isEmptyObject(object) {
    return Object.keys(object).length === 0;
}
exports.isEmptyObject = isEmptyObject;
function mapValues(object, fn) {
    var newObject = {};
    for (var _i = 0, _a = Object.keys(object); _i < _a.length; _i++) {
        var key = _a[_i];
        newObject[key] = fn(object[key]);
    }
    return newObject;
}
exports.mapValues = mapValues;
//# sourceMappingURL=objectUtils.js.map