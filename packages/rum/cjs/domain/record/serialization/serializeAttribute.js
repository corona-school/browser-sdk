"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeAttribute = void 0;
var browser_core_1 = require("@datadog/browser-core");
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var constants_1 = require("../../../constants");
var privacy_1 = require("../privacy");
function serializeAttribute(element, nodePrivacyLevel, attributeName, configuration) {
    if (nodePrivacyLevel === constants_1.NodePrivacyLevel.HIDDEN) {
        // dup condition for direct access case
        return null;
    }
    var attributeValue = element.getAttribute(attributeName);
    if (nodePrivacyLevel === constants_1.NodePrivacyLevel.MASK &&
        attributeName !== constants_1.PRIVACY_ATTR_NAME &&
        !browser_rum_core_1.STABLE_ATTRIBUTES.includes(attributeName) &&
        attributeName !== configuration.actionNameAttribute) {
        var tagName = element.tagName;
        switch (attributeName) {
            // Mask Attribute text content
            case 'title':
            case 'alt':
            case 'placeholder':
                return constants_1.CENSORED_STRING_MARK;
        }
        // mask image URLs
        if (tagName === 'IMG' || tagName === 'SOURCE') {
            if (attributeName === 'src' || attributeName === 'srcset') {
                return constants_1.CENSORED_IMG_MARK;
            }
        }
        // mask <a> URLs
        if (tagName === 'A' && attributeName === 'href') {
            return constants_1.CENSORED_STRING_MARK;
        }
        // mask data-* attributes
        if (attributeValue && (0, browser_core_1.startsWith)(attributeName, 'data-')) {
            // Exception: it's safe to reveal the `${PRIVACY_ATTR_NAME}` attr
            return constants_1.CENSORED_STRING_MARK;
        }
    }
    if (!attributeValue || typeof attributeValue !== 'string') {
        return attributeValue;
    }
    // Minimum Fix for customer.
    if (attributeValue.length > privacy_1.MAX_ATTRIBUTE_VALUE_CHAR_LENGTH && attributeValue.slice(0, 5) === 'data:') {
        return 'data:truncated';
    }
    return attributeValue;
}
exports.serializeAttribute = serializeAttribute;
//# sourceMappingURL=serializeAttribute.js.map