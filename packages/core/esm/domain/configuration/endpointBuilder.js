import { timeStampNow } from '../../tools/utils/timeUtils';
import { normalizeUrl } from '../../tools/utils/urlPolyfill';
import { ExperimentalFeature, isExperimentalFeatureEnabled } from '../../tools/experimentalFeatures';
import { generateUUID } from '../../tools/utils/stringUtils';
import { INTAKE_SITE_AP1, INTAKE_SITE_US1 } from './intakeSites';
export var ENDPOINTS = {
    logs: 'logs',
    rum: 'rum',
    sessionReplay: 'session-replay',
};
var INTAKE_TRACKS = {
    logs: 'logs',
    rum: 'rum',
    sessionReplay: 'replay',
};
export function createEndpointBuilder(initConfiguration, endpointType, configurationTags) {
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
/**
 * Create a function used to build a full endpoint url from provided parameters. The goal of this
 * function is to pre-compute some parts of the URL to avoid re-computing everything on every
 * request, as only parameters are changing.
 */
function createEndpointUrlWithParametersBuilder(initConfiguration, endpointType) {
    var path = "/api/v2/".concat(INTAKE_TRACKS[endpointType]);
    var proxy = initConfiguration.proxy, proxyUrl = initConfiguration.proxyUrl;
    if (proxy) {
        var normalizedProxyUrl_1 = normalizeUrl(proxy);
        return function (parameters) { return "".concat(normalizedProxyUrl_1, "?ddforward=").concat(encodeURIComponent("".concat(path, "?").concat(parameters))); };
    }
    var host = buildEndpointHost(initConfiguration, endpointType);
    if (proxy === undefined && proxyUrl) {
        // TODO: remove this in a future major.
        var normalizedProxyUrl_2 = normalizeUrl(proxyUrl);
        return function (parameters) {
            return "".concat(normalizedProxyUrl_2, "?ddforward=").concat(encodeURIComponent("https://".concat(host).concat(path, "?").concat(parameters)));
        };
    }
    return function (parameters) { return "https://".concat(host).concat(path, "?").concat(parameters); };
}
function buildEndpointHost(initConfiguration, endpointType) {
    var _a = initConfiguration.site, site = _a === void 0 ? INTAKE_SITE_US1 : _a, internalAnalyticsSubdomain = initConfiguration.internalAnalyticsSubdomain;
    if (internalAnalyticsSubdomain && site === INTAKE_SITE_US1) {
        return "".concat(internalAnalyticsSubdomain, ".").concat(INTAKE_SITE_US1);
    }
    var domainParts = site.split('.');
    var extension = domainParts.pop();
    var subdomain = site !== INTAKE_SITE_AP1 ? "".concat(ENDPOINTS[endpointType], ".") : '';
    return "".concat(subdomain, "browser-intake-").concat(domainParts.join('-'), ".").concat(extension);
}
/**
 * Build parameters to be used for an intake request. Parameters should be re-built for each
 * request, as they change randomly.
 */
function buildEndpointParameters(_a, endpointType, configurationTags, api, flushReason, retry) {
    var clientToken = _a.clientToken, internalAnalyticsSubdomain = _a.internalAnalyticsSubdomain;
    var tags = ["sdk_version:".concat("dev"), "api:".concat(api)].concat(configurationTags);
    if (flushReason && isExperimentalFeatureEnabled(ExperimentalFeature.COLLECT_FLUSH_REASON)) {
        tags.push("flush_reason:".concat(flushReason));
    }
    if (retry) {
        tags.push("retry_count:".concat(retry.count), "retry_after:".concat(retry.lastFailureStatus));
    }
    var parameters = [
        'ddsource=browser',
        "ddtags=".concat(encodeURIComponent(tags.join(','))),
        "dd-api-key=".concat(clientToken),
        "dd-evp-origin-version=".concat(encodeURIComponent("dev")),
        'dd-evp-origin=browser',
        "dd-request-id=".concat(generateUUID()),
    ];
    if (endpointType === 'rum') {
        parameters.push("batch_time=".concat(timeStampNow()));
    }
    if (internalAnalyticsSubdomain) {
        parameters.reverse();
    }
    return parameters.join('&');
}
//# sourceMappingURL=endpointBuilder.js.map