"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeConfiguration = exports.validateAndBuildConfiguration = exports.DefaultPrivacyLevel = void 0;
var catchUserErrors_1 = require("../../tools/catchUserErrors");
var display_1 = require("../../tools/display");
var experimentalFeatures_1 = require("../../tools/experimentalFeatures");
var timeUtils_1 = require("../../tools/utils/timeUtils");
var numberUtils_1 = require("../../tools/utils/numberUtils");
var byteUtils_1 = require("../../tools/utils/byteUtils");
var objectUtils_1 = require("../../tools/utils/objectUtils");
var polyfills_1 = require("../../tools/utils/polyfills");
var sessionStore_1 = require("../session/sessionStore");
var transportConfiguration_1 = require("./transportConfiguration");
exports.DefaultPrivacyLevel = {
    ALLOW: 'allow',
    MASK: 'mask',
    MASK_USER_INPUT: 'mask-user-input',
};
function validateAndBuildConfiguration(initConfiguration) {
    var _a, _b, _c;
    if (!initConfiguration || !initConfiguration.clientToken) {
        display_1.display.error('Client Token is not configured, we will not send any data.');
        return;
    }
    var sessionSampleRate = (_a = initConfiguration.sessionSampleRate) !== null && _a !== void 0 ? _a : initConfiguration.sampleRate;
    if (sessionSampleRate !== undefined && !(0, numberUtils_1.isPercentage)(sessionSampleRate)) {
        display_1.display.error('Session Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.telemetrySampleRate !== undefined && !(0, numberUtils_1.isPercentage)(initConfiguration.telemetrySampleRate)) {
        display_1.display.error('Telemetry Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.telemetryConfigurationSampleRate !== undefined &&
        !(0, numberUtils_1.isPercentage)(initConfiguration.telemetryConfigurationSampleRate)) {
        display_1.display.error('Telemetry Configuration Sample Rate should be a number between 0 and 100');
        return;
    }
    // Set the experimental feature flags as early as possible, so we can use them in most places
    if (Array.isArray(initConfiguration.enableExperimentalFeatures)) {
        (0, experimentalFeatures_1.addExperimentalFeatures)(initConfiguration.enableExperimentalFeatures.filter(function (flag) {
            return (0, objectUtils_1.objectHasValue)(experimentalFeatures_1.ExperimentalFeature, flag);
        }));
    }
    return (0, polyfills_1.assign)({
        beforeSend: initConfiguration.beforeSend && (0, catchUserErrors_1.catchUserErrors)(initConfiguration.beforeSend, 'beforeSend threw an error:'),
        sessionStoreStrategyType: (0, sessionStore_1.selectSessionStoreStrategyType)(initConfiguration),
        sessionSampleRate: sessionSampleRate !== null && sessionSampleRate !== void 0 ? sessionSampleRate : 100,
        telemetrySampleRate: (_b = initConfiguration.telemetrySampleRate) !== null && _b !== void 0 ? _b : 20,
        telemetryConfigurationSampleRate: (_c = initConfiguration.telemetryConfigurationSampleRate) !== null && _c !== void 0 ? _c : 5,
        service: initConfiguration.service,
        silentMultipleInit: !!initConfiguration.silentMultipleInit,
        /**
         * beacon payload max queue size implementation is 64kb
         * ensure that we leave room for logs, rum and potential other users
         */
        batchBytesLimit: 16 * byteUtils_1.ONE_KIBI_BYTE,
        eventRateLimiterThreshold: 3000,
        maxTelemetryEventsPerPage: 15,
        /**
         * flush automatically, aim to be lower than ALB connection timeout
         * to maximize connection reuse.
         */
        flushTimeout: (30 * timeUtils_1.ONE_SECOND),
        /**
         * Logs intake limit
         */
        batchMessagesLimit: 50,
        messageBytesLimit: 256 * byteUtils_1.ONE_KIBI_BYTE,
    }, (0, transportConfiguration_1.computeTransportConfiguration)(initConfiguration));
}
exports.validateAndBuildConfiguration = validateAndBuildConfiguration;
function serializeConfiguration(initConfiguration) {
    var _a, _b;
    var proxy = (_a = initConfiguration.proxy) !== null && _a !== void 0 ? _a : initConfiguration.proxyUrl;
    return {
        session_sample_rate: (_b = initConfiguration.sessionSampleRate) !== null && _b !== void 0 ? _b : initConfiguration.sampleRate,
        telemetry_sample_rate: initConfiguration.telemetrySampleRate,
        telemetry_configuration_sample_rate: initConfiguration.telemetryConfigurationSampleRate,
        use_before_send: !!initConfiguration.beforeSend,
        use_cross_site_session_cookie: initConfiguration.useCrossSiteSessionCookie,
        use_secure_session_cookie: initConfiguration.useSecureSessionCookie,
        use_proxy: proxy !== undefined ? !!proxy : undefined,
        silent_multiple_init: initConfiguration.silentMultipleInit,
        track_session_across_subdomains: initConfiguration.trackSessionAcrossSubdomains,
        track_resources: initConfiguration.trackResources,
        track_long_task: initConfiguration.trackLongTasks,
        allow_fallback_to_local_storage: !!initConfiguration.allowFallbackToLocalStorage,
        store_contexts_across_pages: !!initConfiguration.storeContextsAcrossPages,
    };
}
exports.serializeConfiguration = serializeConfiguration;
//# sourceMappingURL=configuration.js.map