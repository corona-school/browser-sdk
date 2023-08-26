"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLinkElementOrigin = exports.getLocationOrigin = exports.buildUrl = exports.getHash = exports.getSearch = exports.getPathName = exports.getOrigin = exports.isValidUrl = exports.normalizeUrl = void 0;
var jsonStringify_1 = require("../serialisation/jsonStringify");
function normalizeUrl(url) {
    return buildUrl(url, getLocationOrigin()).href;
}
exports.normalizeUrl = normalizeUrl;
function isValidUrl(url) {
    try {
        return !!buildUrl(url);
    }
    catch (_a) {
        return false;
    }
}
exports.isValidUrl = isValidUrl;
function getOrigin(url) {
    return getLinkElementOrigin(buildUrl(url));
}
exports.getOrigin = getOrigin;
function getPathName(url) {
    var pathname = buildUrl(url).pathname;
    return pathname[0] === '/' ? pathname : "/".concat(pathname);
}
exports.getPathName = getPathName;
function getSearch(url) {
    return buildUrl(url).search;
}
exports.getSearch = getSearch;
function getHash(url) {
    return buildUrl(url).hash;
}
exports.getHash = getHash;
function buildUrl(url, base) {
    var supportedURL = getSupportedUrl();
    if (supportedURL) {
        try {
            return base !== undefined ? new supportedURL(url, base) : new supportedURL(url);
        }
        catch (error) {
            throw new Error("Failed to construct URL: ".concat(String(error), " ").concat((0, jsonStringify_1.jsonStringify)({ url: url, base: base })));
        }
    }
    if (base === undefined && !/:/.test(url)) {
        throw new Error("Invalid URL: '".concat(url, "'"));
    }
    var doc = document;
    var anchorElement = doc.createElement('a');
    if (base !== undefined) {
        doc = document.implementation.createHTMLDocument('');
        var baseElement = doc.createElement('base');
        baseElement.href = base;
        doc.head.appendChild(baseElement);
        doc.body.appendChild(anchorElement);
    }
    anchorElement.href = url;
    return anchorElement;
}
exports.buildUrl = buildUrl;
var originalURL = URL;
var isURLSupported;
function getSupportedUrl() {
    if (isURLSupported === undefined) {
        try {
            var url = new originalURL('http://test/path');
            isURLSupported = url.href === 'http://test/path';
        }
        catch (_a) {
            isURLSupported = false;
        }
    }
    return isURLSupported ? originalURL : undefined;
}
function getLocationOrigin() {
    return getLinkElementOrigin(window.location);
}
exports.getLocationOrigin = getLocationOrigin;
/**
 * Fallback
 * On IE HTMLAnchorElement origin is not supported: https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/origin
 * On Firefox window.location.origin is "null" for file: URIs: https://bugzilla.mozilla.org/show_bug.cgi?id=878297
 */
function getLinkElementOrigin(element) {
    if (element.origin && element.origin !== 'null') {
        return element.origin;
    }
    var sanitizedHost = element.host.replace(/(:80|:443)$/, '');
    return "".concat(element.protocol, "//").concat(sanitizedHost);
}
exports.getLinkElementOrigin = getLinkElementOrigin;
//# sourceMappingURL=urlPolyfill.js.map