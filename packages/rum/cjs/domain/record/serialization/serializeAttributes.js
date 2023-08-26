"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeAttributes = void 0;
var browser_core_1 = require("@datadog/browser-core");
var constants_1 = require("../../../constants");
var privacy_1 = require("../privacy");
var serializationUtils_1 = require("./serializationUtils");
var serializeAttribute_1 = require("./serializeAttribute");
function serializeAttributes(element, nodePrivacyLevel, options) {
    var _a;
    if (nodePrivacyLevel === constants_1.NodePrivacyLevel.HIDDEN) {
        return {};
    }
    var safeAttrs = {};
    var tagName = (0, serializationUtils_1.getValidTagName)(element.tagName);
    var doc = element.ownerDocument;
    for (var i = 0; i < element.attributes.length; i += 1) {
        var attribute = element.attributes.item(i);
        var attributeName = attribute.name;
        var attributeValue = (0, serializeAttribute_1.serializeAttribute)(element, nodePrivacyLevel, attributeName, options.configuration);
        if (attributeValue !== null) {
            safeAttrs[attributeName] = attributeValue;
        }
    }
    if (element.value &&
        (tagName === 'textarea' || tagName === 'select' || tagName === 'option' || tagName === 'input')) {
        var formValue = (0, serializationUtils_1.getElementInputValue)(element, nodePrivacyLevel);
        if (formValue !== undefined) {
            safeAttrs.value = formValue;
        }
    }
    /**
     * <Option> can be selected, which occurs if its `value` matches ancestor `<Select>.value`
     */
    if (tagName === 'option' && nodePrivacyLevel === constants_1.NodePrivacyLevel.ALLOW) {
        // For privacy=`MASK`, all the values would be the same, so skip.
        var optionElement = element;
        if (optionElement.selected) {
            safeAttrs.selected = optionElement.selected;
        }
    }
    // remote css
    if (tagName === 'link') {
        var stylesheet = Array.from(doc.styleSheets).find(function (s) { return s.href === element.href; });
        var cssText = getCssRulesString(stylesheet);
        if (cssText && stylesheet && !(0, browser_core_1.isExperimentalFeatureEnabled)(browser_core_1.ExperimentalFeature.DISABLE_REPLAY_INLINE_CSS)) {
            safeAttrs._cssText = cssText;
        }
    }
    // dynamic stylesheet
    if (tagName === 'style' &&
        element.sheet &&
        // TODO: Currently we only try to get dynamic stylesheet when it is an empty style element
        !(element.innerText || element.textContent || '').trim().length) {
        var cssText = getCssRulesString(element.sheet);
        if (cssText) {
            safeAttrs._cssText = cssText;
        }
    }
    /**
     * Forms: input[type=checkbox,radio]
     * The `checked` property for <input> is a little bit special:
     * 1. el.checked is a setter that returns if truthy.
     * 2. getAttribute returns the string value
     * getAttribute('checked') does not sync with `Element.checked`, so use JS property
     * NOTE: `checked` property exists on `HTMLInputElement`. For serializer assumptions, we check for type=radio|check.
     */
    var inputElement = element;
    if (tagName === 'input' && (inputElement.type === 'radio' || inputElement.type === 'checkbox')) {
        if (nodePrivacyLevel === constants_1.NodePrivacyLevel.ALLOW) {
            safeAttrs.checked = !!inputElement.checked;
        }
        else if ((0, privacy_1.shouldMaskNode)(inputElement, nodePrivacyLevel)) {
            delete safeAttrs.checked;
        }
    }
    /**
     * Serialize the media playback state
     */
    if (tagName === 'audio' || tagName === 'video') {
        var mediaElement = element;
        safeAttrs.rr_mediaState = mediaElement.paused ? 'paused' : 'played';
    }
    /**
     * Serialize the scroll state for each element only for full snapshot
     */
    var scrollTop;
    var scrollLeft;
    var serializationContext = options.serializationContext;
    switch (serializationContext.status) {
        case 0 /* SerializationContextStatus.INITIAL_FULL_SNAPSHOT */:
            scrollTop = Math.round(element.scrollTop);
            scrollLeft = Math.round(element.scrollLeft);
            if (scrollTop || scrollLeft) {
                serializationContext.elementsScrollPositions.set(element, { scrollTop: scrollTop, scrollLeft: scrollLeft });
            }
            break;
        case 1 /* SerializationContextStatus.SUBSEQUENT_FULL_SNAPSHOT */:
            if (serializationContext.elementsScrollPositions.has(element)) {
                ;
                (_a = serializationContext.elementsScrollPositions.get(element), scrollTop = _a.scrollTop, scrollLeft = _a.scrollLeft);
            }
            break;
    }
    if (scrollLeft) {
        safeAttrs.rr_scrollLeft = scrollLeft;
    }
    if (scrollTop) {
        safeAttrs.rr_scrollTop = scrollTop;
    }
    return safeAttrs;
}
exports.serializeAttributes = serializeAttributes;
function getCssRulesString(cssStyleSheet) {
    if (!cssStyleSheet) {
        return null;
    }
    var rules;
    try {
        rules = cssStyleSheet.rules || cssStyleSheet.cssRules;
    }
    catch (_a) {
        // if css is protected by CORS we cannot access cssRules see: https://www.w3.org/TR/cssom-1/#the-cssstylesheet-interface
    }
    if (!rules) {
        return null;
    }
    var styleSheetCssText = Array.from(rules, getCssRuleString).join('');
    return (0, serializationUtils_1.switchToAbsoluteUrl)(styleSheetCssText, cssStyleSheet.href);
}
function getCssRuleString(rule) {
    return isCSSImportRule(rule) ? getCssRulesString(rule.styleSheet) || '' : rule.cssText;
}
function isCSSImportRule(rule) {
    return 'styleSheet' in rule;
}
//# sourceMappingURL=serializeAttributes.js.map