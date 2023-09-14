import { ExperimentalFeature, isExperimentalFeatureEnabled } from '@datadog/browser-core';
import { NodePrivacyLevel } from '../../../constants';
import { shouldMaskNode } from '../privacy';
import { getElementInputValue, switchToAbsoluteUrl, getValidTagName } from './serializationUtils';
import { serializeAttribute } from './serializeAttribute';
export function serializeAttributes(element, nodePrivacyLevel, options) {
    var _a;
    if (nodePrivacyLevel === NodePrivacyLevel.HIDDEN) {
        return {};
    }
    var safeAttrs = {};
    var tagName = getValidTagName(element.tagName);
    var doc = element.ownerDocument;
    for (var i = 0; i < element.attributes.length; i += 1) {
        var attribute = element.attributes.item(i);
        var attributeName = attribute.name;
        var attributeValue = serializeAttribute(element, nodePrivacyLevel, attributeName, options.configuration);
        if (attributeValue !== null) {
            safeAttrs[attributeName] = attributeValue;
        }
    }
    if (element.value &&
        (tagName === 'textarea' || tagName === 'select' || tagName === 'option' || tagName === 'input')) {
        var formValue = getElementInputValue(element, nodePrivacyLevel);
        if (formValue !== undefined) {
            safeAttrs.value = formValue;
        }
    }
    /**
     * <Option> can be selected, which occurs if its `value` matches ancestor `<Select>.value`
     */
    if (tagName === 'option' && nodePrivacyLevel === NodePrivacyLevel.ALLOW) {
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
        if (cssText && stylesheet && !isExperimentalFeatureEnabled(ExperimentalFeature.DISABLE_REPLAY_INLINE_CSS)) {
            safeAttrs._cssText = cssText;
        }
    }
    // dynamic stylesheet
    if (tagName === 'style' && element.sheet) {
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
        if (nodePrivacyLevel === NodePrivacyLevel.ALLOW) {
            safeAttrs.checked = !!inputElement.checked;
        }
        else if (shouldMaskNode(inputElement, nodePrivacyLevel)) {
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
export function getCssRulesString(cssStyleSheet) {
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
    return switchToAbsoluteUrl(styleSheetCssText, cssStyleSheet.href);
}
function getCssRuleString(rule) {
    return (
    // If it's an @import rule, try to inline sub-rules recursively with `getCssRulesString`. This
    // operation can fail if the imported stylesheet is protected by CORS, in which case we fallback
    // to the @import rule CSS text.
    (isCSSImportRule(rule) && getCssRulesString(rule.styleSheet)) || rule.cssText);
}
function isCSSImportRule(rule) {
    return 'styleSheet' in rule;
}
//# sourceMappingURL=serializeAttributes.js.map