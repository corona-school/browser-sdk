import { getType, arrayFrom, getOrigin, isMatchOption, serializeConfiguration, assign, DefaultPrivacyLevel, display, isPercentage, objectHasValue, validateAndBuildConfiguration, } from '@datadog/browser-core';
import { isTracingOption } from './tracing/tracer';
export function validateAndBuildRumConfiguration(initConfiguration) {
    var _a, _b, _c, _d, _e, _f;
    if (!initConfiguration.applicationId) {
        display.error('Application ID is not configured, no RUM data will be collected.');
        return;
    }
    if (initConfiguration.sessionReplaySampleRate !== undefined &&
        !isPercentage(initConfiguration.sessionReplaySampleRate)) {
        display.error('Session Replay Sample Rate should be a number between 0 and 100');
        return;
    }
    // TODO remove fallback in next major
    var premiumSampleRate = (_a = initConfiguration.premiumSampleRate) !== null && _a !== void 0 ? _a : initConfiguration.replaySampleRate;
    if (premiumSampleRate !== undefined && initConfiguration.sessionReplaySampleRate !== undefined) {
        display.warn('Ignoring Premium Sample Rate because Session Replay Sample Rate is set');
        premiumSampleRate = undefined;
    }
    if (premiumSampleRate !== undefined && !isPercentage(premiumSampleRate)) {
        display.error('Premium Sample Rate should be a number between 0 and 100');
        return;
    }
    var traceSampleRate = (_b = initConfiguration.traceSampleRate) !== null && _b !== void 0 ? _b : initConfiguration.tracingSampleRate;
    if (traceSampleRate !== undefined && !isPercentage(traceSampleRate)) {
        display.error('Trace Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.excludedActivityUrls !== undefined && !Array.isArray(initConfiguration.excludedActivityUrls)) {
        display.error('Excluded Activity Urls should be an array');
        return;
    }
    var allowedTracingUrls = validateAndBuildTracingOptions(initConfiguration);
    if (!allowedTracingUrls) {
        return;
    }
    var baseConfiguration = validateAndBuildConfiguration(initConfiguration);
    if (!baseConfiguration) {
        return;
    }
    var trackUserInteractions = !!((_c = initConfiguration.trackUserInteractions) !== null && _c !== void 0 ? _c : initConfiguration.trackInteractions);
    var trackFrustrations = !!initConfiguration.trackFrustrations;
    return assign({
        applicationId: initConfiguration.applicationId,
        version: initConfiguration.version,
        actionNameAttribute: initConfiguration.actionNameAttribute,
        sessionReplaySampleRate: (_e = (_d = initConfiguration.sessionReplaySampleRate) !== null && _d !== void 0 ? _d : premiumSampleRate) !== null && _e !== void 0 ? _e : 100,
        oldPlansBehavior: initConfiguration.sessionReplaySampleRate === undefined,
        traceSampleRate: traceSampleRate,
        allowedTracingUrls: allowedTracingUrls,
        excludedActivityUrls: (_f = initConfiguration.excludedActivityUrls) !== null && _f !== void 0 ? _f : [],
        workerUrl: initConfiguration.workerUrl,
        trackUserInteractions: trackUserInteractions || trackFrustrations,
        trackFrustrations: trackFrustrations,
        trackViewsManually: !!initConfiguration.trackViewsManually,
        trackResources: initConfiguration.trackResources,
        trackLongTasks: initConfiguration.trackLongTasks,
        subdomain: initConfiguration.subdomain,
        defaultPrivacyLevel: objectHasValue(DefaultPrivacyLevel, initConfiguration.defaultPrivacyLevel)
            ? initConfiguration.defaultPrivacyLevel
            : DefaultPrivacyLevel.MASK_USER_INPUT,
        customerDataTelemetrySampleRate: 1,
    }, baseConfiguration);
}
/**
 * Handles allowedTracingUrls and processes legacy allowedTracingOrigins
 */
function validateAndBuildTracingOptions(initConfiguration) {
    // Advise about parameters precedence.
    if (initConfiguration.allowedTracingUrls !== undefined && initConfiguration.allowedTracingOrigins !== undefined) {
        display.warn('Both allowedTracingUrls and allowedTracingOrigins (deprecated) have been defined. The parameter allowedTracingUrls will override allowedTracingOrigins.');
    }
    // Handle allowedTracingUrls first
    if (initConfiguration.allowedTracingUrls !== undefined) {
        if (!Array.isArray(initConfiguration.allowedTracingUrls)) {
            display.error('Allowed Tracing URLs should be an array');
            return;
        }
        if (initConfiguration.allowedTracingUrls.length !== 0 && initConfiguration.service === undefined) {
            display.error('Service needs to be configured when tracing is enabled');
            return;
        }
        // Convert from (MatchOption | TracingOption) to TracingOption, remove unknown properties
        var tracingOptions_1 = [];
        initConfiguration.allowedTracingUrls.forEach(function (option) {
            if (isMatchOption(option)) {
                tracingOptions_1.push({ match: option, propagatorTypes: ['datadog'] });
            }
            else if (isTracingOption(option)) {
                tracingOptions_1.push(option);
            }
            else {
                display.warn('Allowed Tracing Urls parameters should be a string, RegExp, function, or an object. Ignoring parameter', option);
            }
        });
        return tracingOptions_1;
    }
    // Handle conversion of allowedTracingOrigins to allowedTracingUrls
    if (initConfiguration.allowedTracingOrigins !== undefined) {
        if (!Array.isArray(initConfiguration.allowedTracingOrigins)) {
            display.error('Allowed Tracing Origins should be an array');
            return;
        }
        if (initConfiguration.allowedTracingOrigins.length !== 0 && initConfiguration.service === undefined) {
            display.error('Service needs to be configured when tracing is enabled');
            return;
        }
        var tracingOptions_2 = [];
        initConfiguration.allowedTracingOrigins.forEach(function (legacyMatchOption) {
            var tracingOption = convertLegacyMatchOptionToTracingOption(legacyMatchOption);
            if (tracingOption) {
                tracingOptions_2.push(tracingOption);
            }
        });
        return tracingOptions_2;
    }
    return [];
}
/**
 * Converts parameters from the deprecated allowedTracingOrigins
 * to allowedTracingUrls. Handles the change from origin to full URLs.
 */
function convertLegacyMatchOptionToTracingOption(item) {
    var match;
    if (typeof item === 'string') {
        match = item;
    }
    else if (item instanceof RegExp) {
        match = function (url) { return item.test(getOrigin(url)); };
    }
    else if (typeof item === 'function') {
        match = function (url) { return item(getOrigin(url)); };
    }
    if (match === undefined) {
        display.warn('Allowed Tracing Origins parameters should be a string, RegExp or function. Ignoring parameter', item);
        return undefined;
    }
    return { match: match, propagatorTypes: ['datadog'] };
}
/**
 * Combines the selected tracing propagators from the different options in allowedTracingUrls,
 * and assumes 'datadog' has been selected when using allowedTracingOrigins
 */
function getSelectedTracingPropagators(configuration) {
    var usedTracingPropagators = new Set();
    if (Array.isArray(configuration.allowedTracingUrls) && configuration.allowedTracingUrls.length > 0) {
        configuration.allowedTracingUrls.forEach(function (option) {
            if (isMatchOption(option)) {
                usedTracingPropagators.add('datadog');
            }
            else if (getType(option) === 'object' && Array.isArray(option.propagatorTypes)) {
                // Ensure we have an array, as we cannot rely on types yet (configuration is provided by users)
                option.propagatorTypes.forEach(function (propagatorType) { return usedTracingPropagators.add(propagatorType); });
            }
        });
    }
    if (Array.isArray(configuration.allowedTracingOrigins) && configuration.allowedTracingOrigins.length > 0) {
        usedTracingPropagators.add('datadog');
    }
    return arrayFrom(usedTracingPropagators);
}
export function serializeRumConfiguration(configuration) {
    var _a, _b;
    var baseSerializedConfiguration = serializeConfiguration(configuration);
    return assign({
        premium_sample_rate: configuration.premiumSampleRate,
        replay_sample_rate: configuration.replaySampleRate,
        session_replay_sample_rate: configuration.sessionReplaySampleRate,
        trace_sample_rate: (_a = configuration.traceSampleRate) !== null && _a !== void 0 ? _a : configuration.tracingSampleRate,
        action_name_attribute: configuration.actionNameAttribute,
        use_allowed_tracing_origins: Array.isArray(configuration.allowedTracingOrigins) && configuration.allowedTracingOrigins.length > 0,
        use_allowed_tracing_urls: Array.isArray(configuration.allowedTracingUrls) && configuration.allowedTracingUrls.length > 0,
        selected_tracing_propagators: getSelectedTracingPropagators(configuration),
        default_privacy_level: configuration.defaultPrivacyLevel,
        use_excluded_activity_urls: Array.isArray(configuration.excludedActivityUrls) && configuration.excludedActivityUrls.length > 0,
        use_worker_url: !!configuration.workerUrl,
        track_frustrations: configuration.trackFrustrations,
        track_views_manually: configuration.trackViewsManually,
        track_user_interactions: (_b = configuration.trackUserInteractions) !== null && _b !== void 0 ? _b : configuration.trackInteractions,
    }, baseSerializedConfiguration);
}
//# sourceMappingURL=configuration.js.map