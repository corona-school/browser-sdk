import { catchUserErrors } from '../../tools/catchUserErrors';
import { display } from '../../tools/display';
import { ExperimentalFeature, addExperimentalFeatures } from '../../tools/experimentalFeatures';
import { ONE_SECOND } from '../../tools/utils/timeUtils';
import { isPercentage } from '../../tools/utils/numberUtils';
import { ONE_KIBI_BYTE } from '../../tools/utils/byteUtils';
import { objectHasValue } from '../../tools/utils/objectUtils';
import { assign } from '../../tools/utils/polyfills';
import { selectSessionStoreStrategyType } from '../session/sessionStore';
import { computeTransportConfiguration } from './transportConfiguration';
export var DefaultPrivacyLevel = {
    ALLOW: 'allow',
    MASK: 'mask',
    MASK_USER_INPUT: 'mask-user-input',
};
export function validateAndBuildConfiguration(initConfiguration) {
    var _a, _b, _c;
    if (!initConfiguration || !initConfiguration.clientToken) {
        display.error('Client Token is not configured, we will not send any data.');
        return;
    }
    var sessionSampleRate = (_a = initConfiguration.sessionSampleRate) !== null && _a !== void 0 ? _a : initConfiguration.sampleRate;
    if (sessionSampleRate !== undefined && !isPercentage(sessionSampleRate)) {
        display.error('Session Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.telemetrySampleRate !== undefined && !isPercentage(initConfiguration.telemetrySampleRate)) {
        display.error('Telemetry Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.telemetryConfigurationSampleRate !== undefined &&
        !isPercentage(initConfiguration.telemetryConfigurationSampleRate)) {
        display.error('Telemetry Configuration Sample Rate should be a number between 0 and 100');
        return;
    }
    // Set the experimental feature flags as early as possible, so we can use them in most places
    if (Array.isArray(initConfiguration.enableExperimentalFeatures)) {
        addExperimentalFeatures(initConfiguration.enableExperimentalFeatures.filter(function (flag) {
            return objectHasValue(ExperimentalFeature, flag);
        }));
    }
    return assign({
        beforeSend: initConfiguration.beforeSend && catchUserErrors(initConfiguration.beforeSend, 'beforeSend threw an error:'),
        sessionStoreStrategyType: selectSessionStoreStrategyType(initConfiguration),
        sessionSampleRate: sessionSampleRate !== null && sessionSampleRate !== void 0 ? sessionSampleRate : 100,
        telemetrySampleRate: (_b = initConfiguration.telemetrySampleRate) !== null && _b !== void 0 ? _b : 20,
        telemetryConfigurationSampleRate: (_c = initConfiguration.telemetryConfigurationSampleRate) !== null && _c !== void 0 ? _c : 5,
        service: initConfiguration.service,
        silentMultipleInit: !!initConfiguration.silentMultipleInit,
        /**
         * beacon payload max queue size implementation is 64kb
         * ensure that we leave room for logs, rum and potential other users
         */
        batchBytesLimit: 16 * ONE_KIBI_BYTE,
        eventRateLimiterThreshold: 3000,
        maxTelemetryEventsPerPage: 15,
        /**
         * flush automatically, aim to be lower than ALB connection timeout
         * to maximize connection reuse.
         */
        flushTimeout: (30 * ONE_SECOND),
        /**
         * Logs intake limit
         */
        batchMessagesLimit: 50,
        messageBytesLimit: 256 * ONE_KIBI_BYTE,
    }, computeTransportConfiguration(initConfiguration));
}
export function serializeConfiguration(initConfiguration) {
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
//# sourceMappingURL=configuration.js.map