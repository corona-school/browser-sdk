import { arrayFrom } from './polyfills';
export function removeDuplicates(array) {
    var set = new Set();
    array.forEach(function (item) { return set.add(item); });
    return arrayFrom(set);
}
//# sourceMappingURL=arrayUtils.js.map