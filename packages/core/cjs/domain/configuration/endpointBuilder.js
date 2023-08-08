"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEndpointBuilder = exports.ENDPOINTS = void 0;
var timeUtils_1 = require("../../tools/utils/timeUtils");
var urlPolyfill_1 = require("../../tools/utils/urlPolyfill");
var experimentalFeatures_1 = require("../../tools/experimentalFeatures");
var stringUtils_1 = require("../../tools/utils/stringUtils");
var intakeSites_1 = require("./intakeSites");
exports.ENDPOINTS = {
    logs: 'logs',
    rum: 'rum',
    sessionReplay: 'session-replay',
};
var INTAKE_TRACKS = {
    logs: 'logs',
    rum: 'rum',
    sessionReplay: 'replay',
};
function createEndpointBuilder(initConfiguration, endpointType, configurationTags) {
    var buildUrlWithParameters = createEndpointUrlWithParametersBuilder(initConfiguration, endpointType);
    return {
        build: function (api, flushReason, retry) {
            var parameters = buildEndpointParameters(initConfiguration, endpointType, configurationTags, api, flushReason, retry);
            return buildUrlWithParameters(parameters);
        },
        urlPrefix: buildUrlWithParameters(''),
        endpointType: endpointType,
    };
}
exports.createEndpointBuilder = createEndpointBuilder;
/**
 * Create a function used to build a full endpoint url from provided parameters. The goal of this
 * function is to pre-compute some parts of the URL to avoid re-computing everything on every
 * request, as only parameters are changing.
 */
function createEndpointUrlWithParametersBuilder(initConfiguration, endpointType) {
    var path = "/api/v2/".concat(INTAKE_TRACKS[endpointType]);
    var proxy = initConfiguration.proxy, proxyUrl = initConfiguration.proxyUrl;
    if (proxy) {
        var normalizedProxyUrl_1 = (0, urlPolyfill_1.normalizeUrl)(proxy);
        return function (parameters) { return "".concat(normalizedProxyUrl_1, "?ddforward=").concat(encodeURIComponent("".concat(path, "?").concat(parameters))); };
    }
    var host = buildEndpointHost(initConfiguration, endpointType);
    if (proxy === undefined && proxyUrl) {
        // TODO: remove this in a future major.
        var normalizedProxyUrl_2 = (0, urlPolyfill_1.normalizeUrl)(proxyUrl);
        return function (parameters) {
            return "".concat(normalizedProxyUrl_2, "?ddforward=").concat(encodeURIComponent("https://".concat(host).concat(path, "?").concat(parameters)));
        };
    }
    return function (parameters) { return "https://".concat(host).concat(path, "?").concat(parameters); };
}
function buildEndpointHost(initConfiguration, endpointType) {
    var _a = initConfiguration.site, site = _a === void 0 ? intakeSites_1.INTAKE_SITE_US1 : _a, internalAnalyticsSubdomain = initConfiguration.internalAnalyticsSubdomain;
    if (internalAnalyticsSubdomain && site === intakeSites_1.INTAKE_SITE_US1) {
        return "".concat(internalAnalyticsSubdomain, ".").concat(intakeSites_1.INTAKE_SITE_US1);
    }
    var domainParts = site.split('.');
    var extension = domainParts.pop();
    var subdomain = site !== intakeSites_1.INTAKE_SITE_AP1 ? "".concat(exports.ENDPOINTS[endpointType], ".") : '';
    return "".concat(subdomain, "browser-intake-").concat(domainParts.join('-'), ".").concat(extension);
}
/**
 * Build parameters to be used for an intake request. Parameters should be re-built for each
 * request, as they change randomly.
 */
function buildEndpointParameters(_a, endpointType, configurationTags, api, flushReason, retry) {
    var clientToken = _a.clientToken, internalAnalyticsSubdomain = _a.internalAnalyticsSubdomain;
    var tags = ["sdk_version:".concat("4.45.0"), "api:".concat(api)].concat(configurationTags);
    if (flushReason && (0, experimentalFeatures_1.isExperimentalFeatureEnabled)(experimentalFeatures_1.ExperimentalFeature.COLLECT_FLUSH_REASON)) {
        tags.push("flush_reason:".concat(flushReason));
    }
    if (retry) {
        tags.push("retry_count:".concat(retry.count), "retry_after:".concat(retry.lastFailureStatus));
    }
    var parameters = [
        'ddsource=browser',
        "ddtags=".concat(encodeURIComponent(tags.join(','))),
        "dd-api-key=".concat(clientToken),
        "dd-evp-origin-version=".concat(encodeURIComponent("4.45.0")),
        'dd-evp-origin=browser',
        "dd-request-id=".concat((0, stringUtils_1.generateUUID)()),
    ];
    if (endpointType === 'rum') {
        parameters.push("batch_time=".concat((0, timeUtils_1.timeStampNow)()));
    }
    if (internalAnalyticsSubdomain) {
        parameters.reverse();
    }
    return parameters.join('&');
}
//# sourceMappingURL=endpointBuilder.js.map