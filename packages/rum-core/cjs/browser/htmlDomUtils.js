"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParentNode = exports.getChildNodes = exports.isNodeShadowRoot = exports.isNodeShadowHost = exports.isElementNode = exports.isCommentNode = exports.isTextNode = void 0;
function isTextNode(node) {
    return node.nodeType === Node.TEXT_NODE;
}
exports.isTextNode = isTextNode;
function isCommentNode(node) {
    return node.nodeType === Node.COMMENT_NODE;
}
exports.isCommentNode = isCommentNode;
function isElementNode(node) {
    return node.nodeType === Node.ELEMENT_NODE;
}
exports.isElementNode = isElementNode;
function isNodeShadowHost(node) {
    return isElementNode(node) && Boolean(node.shadowRoot);
}
exports.isNodeShadowHost = isNodeShadowHost;
function isNodeShadowRoot(node) {
    var shadowRoot = node;
    return !!shadowRoot.host && shadowRoot.nodeType === Node.DOCUMENT_FRAGMENT_NODE && isElementNode(shadowRoot.host);
}
exports.isNodeShadowRoot = isNodeShadowRoot;
function getChildNodes(node) {
    return isNodeShadowHost(node) ? node.shadowRoot.childNodes : node.childNodes;
}
exports.getChildNodes = getChildNodes;
/**
 * Return `host` in case if the current node is a shadow root otherwise will return the `parentNode`
 */
function getParentNode(node) {
    return isNodeShadowRoot(node) ? node.host : node.parentNode;
}
exports.getParentNode = getParentNode;
//# sourceMappingURL=htmlDomUtils.js.map