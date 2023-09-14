"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDuplicates = void 0;
var polyfills_1 = require("./polyfills");
function removeDuplicates(array) {
    var set = new Set();
    array.forEach(function (item) { return set.add(item); });
    return (0, polyfills_1.arrayFrom)(set);
}
exports.removeDuplicates = removeDuplicates;
//# sourceMappingURL=arrayUtils.js.map