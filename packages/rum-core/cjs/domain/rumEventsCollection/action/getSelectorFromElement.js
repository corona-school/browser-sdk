"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportScopeSelector = exports.getSelectorFromElement = exports.STABLE_ATTRIBUTES = void 0;
var browser_core_1 = require("@datadog/browser-core");
var getActionNameFromElement_1 = require("./getActionNameFromElement");
/**
 * Stable attributes are attributes that are commonly used to identify parts of a UI (ex:
 * component). Those attribute values should not be generated randomly (hardcoded most of the time)
 * and stay the same across deploys. They are not necessarily unique across the document.
 */
exports.STABLE_ATTRIBUTES = [
    getActionNameFromElement_1.DEFAULT_PROGRAMMATIC_ACTION_NAME_ATTRIBUTE,
    // Common test attributes (list provided by google recorder)
    'data-testid',
    'data-test',
    'data-qa',
    'data-cy',
    'data-test-id',
    'data-qa-id',
    'data-testing',
    // FullStory decorator attributes:
    'data-component',
    'data-element',
    'data-source-file',
];
// Selectors to use if they target a single element on the whole document. Those selectors are
// considered as "stable" and uniquely identify an element regardless of the page state. If we find
// one, we should consider the selector "complete" and stop iterating over ancestors.
var GLOBALLY_UNIQUE_SELECTOR_GETTERS = [getStableAttributeSelector, getIDSelector];
// Selectors to use if they target a single element among an element descendants. Those selectors
// are more brittle than "globally unique" selectors and should be combined with ancestor selectors
// to improve specificity.
var UNIQUE_AMONG_CHILDREN_SELECTOR_GETTERS = [
    getStableAttributeSelector,
    getClassSelector,
    getTagNameSelector,
];
function getSelectorFromElement(targetElement, actionNameAttribute) {
    var targetElementSelector = '';
    var element = targetElement;
    while (element && element.nodeName !== 'HTML') {
        var globallyUniqueSelector = findSelector(element, GLOBALLY_UNIQUE_SELECTOR_GETTERS, isSelectorUniqueGlobally, actionNameAttribute, targetElementSelector);
        if (globallyUniqueSelector) {
            return globallyUniqueSelector;
        }
        var uniqueSelectorAmongChildren = findSelector(element, UNIQUE_AMONG_CHILDREN_SELECTOR_GETTERS, isSelectorUniqueAmongSiblings, actionNameAttribute, targetElementSelector);
        targetElementSelector =
            uniqueSelectorAmongChildren || combineSelector(getPositionSelector(element), targetElementSelector);
        element = element.parentElement;
    }
    return targetElementSelector;
}
exports.getSelectorFromElement = getSelectorFromElement;
function isGeneratedValue(value) {
    // To compute the "URL path group", the backend replaces every URL path parts as a question mark
    // if it thinks the part is an identifier. The condition it uses is to checks whether a digit is
    // present.
    //
    // Here, we use the same strategy: if a the value contains a digit, we consider it generated. This
    // strategy might be a bit naive and fail in some cases, but there are many fallbacks to generate
    // CSS selectors so it should be fine most of the time. We might want to allow customers to
    // provide their own `isGeneratedValue` at some point.
    return /[0-9]/.test(value);
}
function getIDSelector(element) {
    if (element.id && !isGeneratedValue(element.id)) {
        return "#".concat((0, browser_core_1.cssEscape)(element.id));
    }
}
function getClassSelector(element) {
    if (element.tagName === 'BODY') {
        return;
    }
    if (element.classList.length > 0) {
        for (var i = 0; i < element.classList.length; i += 1) {
            var className = element.classList[i];
            if (isGeneratedValue(className)) {
                continue;
            }
            return "".concat(element.tagName, ".").concat((0, browser_core_1.cssEscape)(className));
        }
    }
}
function getTagNameSelector(element) {
    return element.tagName;
}
function getStableAttributeSelector(element, actionNameAttribute) {
    if (actionNameAttribute) {
        var selector = getAttributeSelector(actionNameAttribute);
        if (selector) {
            return selector;
        }
    }
    for (var _i = 0, STABLE_ATTRIBUTES_1 = exports.STABLE_ATTRIBUTES; _i < STABLE_ATTRIBUTES_1.length; _i++) {
        var attributeName = STABLE_ATTRIBUTES_1[_i];
        var selector = getAttributeSelector(attributeName);
        if (selector) {
            return selector;
        }
    }
    function getAttributeSelector(attributeName) {
        if (element.hasAttribute(attributeName)) {
            return "".concat(element.tagName, "[").concat(attributeName, "=\"").concat((0, browser_core_1.cssEscape)(element.getAttribute(attributeName)), "\"]");
        }
    }
}
function getPositionSelector(element) {
    var sibling = element.parentElement.firstElementChild;
    var elementIndex = 1;
    while (sibling && sibling !== element) {
        if (sibling.tagName === element.tagName) {
            elementIndex += 1;
        }
        sibling = sibling.nextElementSibling;
    }
    return "".concat(element.tagName, ":nth-of-type(").concat(elementIndex, ")");
}
function findSelector(element, selectorGetters, predicate, actionNameAttribute, childSelector) {
    for (var _i = 0, selectorGetters_1 = selectorGetters; _i < selectorGetters_1.length; _i++) {
        var selectorGetter = selectorGetters_1[_i];
        var elementSelector = selectorGetter(element, actionNameAttribute);
        if (!elementSelector) {
            continue;
        }
        var fullSelector = combineSelector(elementSelector, childSelector);
        if (predicate(element, fullSelector)) {
            return fullSelector;
        }
    }
}
/**
 * Check whether the selector is unique among the whole document.
 */
function isSelectorUniqueGlobally(element, selector) {
    return element.ownerDocument.querySelectorAll(selector).length === 1;
}
/**
 * Check whether the selector is unique among the element siblings. In other words, it returns true
 * if "ELEMENT_PARENT > SELECTOR" returns a single element.
 *
 * The result will be less accurate on browsers that don't support :scope (i. e. IE): it will check
 * for any element matching the selector contained in the parent (in other words,
 * "ELEMENT_PARENT SELECTOR" returns a single element), regardless of whether the selector is a
 * direct descendent of the element parent. This should not impact results too much: if it
 * inaccurately returns false, we'll just fall back to another strategy.
 */
function isSelectorUniqueAmongSiblings(element, selector) {
    return (element.parentElement.querySelectorAll(supportScopeSelector() ? combineSelector(':scope', selector) : selector)
        .length === 1);
}
function combineSelector(parent, child) {
    return child ? "".concat(parent, ">").concat(child) : parent;
}
var supportScopeSelectorCache;
function supportScopeSelector() {
    if (supportScopeSelectorCache === undefined) {
        try {
            document.querySelector(':scope');
            supportScopeSelectorCache = true;
        }
        catch (_a) {
            supportScopeSelectorCache = false;
        }
    }
    return supportScopeSelectorCache;
}
exports.supportScopeSelector = supportScopeSelector;
//# sourceMappingURL=getSelectorFromElement.js.map