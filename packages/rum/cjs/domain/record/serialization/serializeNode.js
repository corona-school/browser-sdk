"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeDocumentNode = exports.serializeChildNodes = exports.generateNextId = exports.serializeNodeWithId = void 0;
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var browser_core_1 = require("@datadog/browser-core");
var types_1 = require("../../../types");
var constants_1 = require("../../../constants");
var privacy_1 = require("../privacy");
var serializationUtils_1 = require("./serializationUtils");
var serializeStyleSheets_1 = require("./serializeStyleSheets");
var serializeAttributes_1 = require("./serializeAttributes");
function serializeNodeWithId(node, options) {
    var serializedNode = serializeNode(node, options);
    if (!serializedNode) {
        return null;
    }
    // Try to reuse the previous id
    var id = (0, serializationUtils_1.getSerializedNodeId)(node) || generateNextId();
    var serializedNodeWithId = serializedNode;
    serializedNodeWithId.id = id;
    (0, serializationUtils_1.setSerializedNodeId)(node, id);
    if (options.serializedNodeIds) {
        options.serializedNodeIds.add(id);
    }
    return serializedNodeWithId;
}
exports.serializeNodeWithId = serializeNodeWithId;
var _nextId = 1;
function generateNextId() {
    return _nextId++;
}
exports.generateNextId = generateNextId;
function serializeChildNodes(node, options) {
    var result = [];
    node.childNodes.forEach(function (childNode) {
        var serializedChildNode = serializeNodeWithId(childNode, options);
        if (serializedChildNode) {
            result.push(serializedChildNode);
        }
    });
    return result;
}
exports.serializeChildNodes = serializeChildNodes;
function serializeNode(node, options) {
    switch (node.nodeType) {
        case node.DOCUMENT_NODE:
            return serializeDocumentNode(node, options);
        case node.DOCUMENT_FRAGMENT_NODE:
            return serializeDocumentFragmentNode(node, options);
        case node.DOCUMENT_TYPE_NODE:
            return serializeDocumentTypeNode(node);
        case node.ELEMENT_NODE:
            return serializeElementNode(node, options);
        case node.TEXT_NODE:
            return serializeTextNode(node, options);
        case node.CDATA_SECTION_NODE:
            return serializeCDataNode();
    }
}
function serializeDocumentNode(document, options) {
    return {
        type: types_1.NodeType.Document,
        childNodes: serializeChildNodes(document, options),
        adoptedStyleSheets: (0, serializeStyleSheets_1.serializeStyleSheets)(document.adoptedStyleSheets),
    };
}
exports.serializeDocumentNode = serializeDocumentNode;
function serializeDocumentFragmentNode(element, options) {
    var childNodes = [];
    if (element.childNodes.length) {
        childNodes = serializeChildNodes(element, options);
    }
    var isShadowRoot = (0, browser_rum_core_1.isNodeShadowRoot)(element);
    if (isShadowRoot) {
        options.serializationContext.shadowRootsController.addShadowRoot(element);
    }
    return {
        type: types_1.NodeType.DocumentFragment,
        childNodes: childNodes,
        isShadowRoot: isShadowRoot,
        adoptedStyleSheets: isShadowRoot ? (0, serializeStyleSheets_1.serializeStyleSheets)(element.adoptedStyleSheets) : undefined,
    };
}
function serializeDocumentTypeNode(documentType) {
    return {
        type: types_1.NodeType.DocumentType,
        name: documentType.name,
        publicId: documentType.publicId,
        systemId: documentType.systemId,
    };
}
/**
 * Serializing Element nodes involves capturing:
 * 1. HTML ATTRIBUTES:
 * 2. JS STATE:
 * - scroll offsets
 * - Form fields (input value, checkbox checked, option selection, range)
 * - Canvas state,
 * - Media (video/audio) play mode + currentTime
 * - iframe contents
 * - webcomponents
 * 3. CUSTOM PROPERTIES:
 * - height+width for when `hidden` to cover the element
 * 4. EXCLUDED INTERACTION STATE:
 * - focus (possible, but not worth perf impact)
 * - hover (tracked only via mouse activity)
 * - fullscreen mode
 */
function serializeElementNode(element, options) {
    var _a;
    var tagName = (0, serializationUtils_1.getValidTagName)(element.tagName);
    var isSVG = isSVGElement(element) || undefined;
    // For performance reason, we don't use getNodePrivacyLevel directly: we leverage the
    // parentNodePrivacyLevel option to avoid iterating over all parents
    var nodePrivacyLevel = (0, privacy_1.reducePrivacyLevel)((0, privacy_1.getNodeSelfPrivacyLevel)(element), options.parentNodePrivacyLevel);
    if (nodePrivacyLevel === constants_1.NodePrivacyLevel.HIDDEN) {
        var _b = element.getBoundingClientRect(), width = _b.width, height = _b.height;
        return {
            type: types_1.NodeType.Element,
            tagName: tagName,
            attributes: (_a = {
                    rr_width: "".concat(width, "px"),
                    rr_height: "".concat(height, "px")
                },
                _a[constants_1.PRIVACY_ATTR_NAME] = constants_1.PRIVACY_ATTR_VALUE_HIDDEN,
                _a),
            childNodes: [],
            isSVG: isSVG,
        };
    }
    // Ignore Elements like Script and some Link, Metas
    if (nodePrivacyLevel === constants_1.NodePrivacyLevel.IGNORE) {
        return;
    }
    var attributes = (0, serializeAttributes_1.serializeAttributes)(element, nodePrivacyLevel, options);
    var childNodes = [];
    if (element.childNodes.length) {
        // OBJECT POOLING OPTIMIZATION:
        // We should not create a new object systematically as it could impact performances. Try to reuse
        // the same object as much as possible, and clone it only if we need to.
        var childNodesSerializationOptions = void 0;
        if (options.parentNodePrivacyLevel === nodePrivacyLevel && options.ignoreWhiteSpace === (tagName === 'head')) {
            childNodesSerializationOptions = options;
        }
        else {
            childNodesSerializationOptions = (0, browser_core_1.assign)({}, options, {
                parentNodePrivacyLevel: nodePrivacyLevel,
                ignoreWhiteSpace: tagName === 'head',
            });
        }
        childNodes = serializeChildNodes(element, childNodesSerializationOptions);
    }
    if ((0, browser_rum_core_1.isNodeShadowHost)(element)) {
        var shadowRoot = serializeNodeWithId(element.shadowRoot, options);
        if (shadowRoot !== null) {
            childNodes.push(shadowRoot);
        }
    }
    return {
        type: types_1.NodeType.Element,
        tagName: tagName,
        attributes: attributes,
        childNodes: childNodes,
        isSVG: isSVG,
    };
}
function isSVGElement(el) {
    return el.tagName === 'svg' || el instanceof SVGElement;
}
/**
 * Text Nodes are dependant on Element nodes
 * Privacy levels are set on elements so we check the parentElement of a text node
 * for privacy level.
 */
function serializeTextNode(textNode, options) {
    var _a;
    // The parent node may not be a html element which has a tagName attribute.
    // So just let it be undefined which is ok in this use case.
    var parentTagName = (_a = textNode.parentElement) === null || _a === void 0 ? void 0 : _a.tagName;
    var textContent = (0, privacy_1.getTextContent)(textNode, options.ignoreWhiteSpace || false, options.parentNodePrivacyLevel);
    if (textContent === undefined) {
        return;
    }
    return {
        type: types_1.NodeType.Text,
        textContent: textContent,
        isStyle: parentTagName === 'STYLE' ? true : undefined,
    };
}
function serializeCDataNode() {
    return {
        type: types_1.NodeType.CDATA,
        textContent: '',
    };
}
//# sourceMappingURL=serializeNode.js.map