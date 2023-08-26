export function includes(candidate, search) {
    return candidate.indexOf(search) !== -1;
}
export function arrayFrom(arrayLike) {
    if (Array.from) {
        return Array.from(arrayLike);
    }
    var array = [];
    if (arrayLike instanceof Set) {
        arrayLike.forEach(function (item) { return array.push(item); });
    }
    else {
        for (var i = 0; i < arrayLike.length; i++) {
            array.push(arrayLike[i]);
        }
    }
    return array;
}
export function find(array, predicate) {
    for (var i = 0; i < array.length; i += 1) {
        var item = array[i];
        if (predicate(item, i)) {
            return item;
        }
    }
    return undefined;
}
export function findLast(array, predicate) {
    for (var i = array.length - 1; i >= 0; i -= 1) {
        var item = array[i];
        if (predicate(item, i, array)) {
            return item;
        }
    }
    return undefined;
}
export function forEach(list, callback) {
    Array.prototype.forEach.call(list, callback);
}
export function objectValues(object) {
    return Object.keys(object).map(function (key) { return object[key]; });
}
export function objectEntries(object) {
    return Object.keys(object).map(function (key) { return [key, object[key]]; });
}
export function startsWith(candidate, search) {
    return candidate.slice(0, search.length) === search;
}
export function endsWith(candidate, search) {
    return candidate.slice(-search.length) === search;
}
export function elementMatches(element, selector) {
    if (element.matches) {
        return element.matches(selector);
    }
    // IE11 support
    if (element.msMatchesSelector) {
        return element.msMatchesSelector(selector);
    }
    return false;
}
// https://github.com/jquery/jquery/blob/a684e6ba836f7c553968d7d026ed7941e1a612d8/src/selector/escapeSelector.js
export function cssEscape(str) {
    if (window.CSS && window.CSS.escape) {
        return window.CSS.escape(str);
    }
    // eslint-disable-next-line no-control-regex
    return str.replace(/([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g, function (ch, asCodePoint) {
        if (asCodePoint) {
            // U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
            if (ch === '\0') {
                return '\uFFFD';
            }
            // Control characters and (dependent upon position) numbers get escaped as code points
            return "".concat(ch.slice(0, -1), "\\").concat(ch.charCodeAt(ch.length - 1).toString(16), " ");
        }
        // Other potentially-special ASCII characters get backslash-escaped
        return "\\".concat(ch);
    });
}
export function assign(target) {
    var toAssign = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        toAssign[_i - 1] = arguments[_i];
    }
    toAssign.forEach(function (source) {
        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    });
    return target;
}
//# sourceMappingURL=polyfills.js.map