import { noop, willSyntheticsInjectRum, assign, BoundedBuffer, createContextManager, deepClone, makePublicApi, monitor, clocksNow, timeStampNow, display, callMonitored, createHandlingStack, canUseEventBridge, checkUser, sanitizeUser, sanitize, } from '@datadog/browser-core';
import { validateAndBuildRumConfiguration } from '../domain/configuration';
import { buildCommonContext } from '../domain/contexts/commonContext';
export function makeRumPublicApi(startRumImpl, recorderApi, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.ignoreInitIfSyntheticsWillInjectRum, ignoreInitIfSyntheticsWillInjectRum = _c === void 0 ? true : _c;
    var isAlreadyInitialized = false;
    var globalContextManager = createContextManager("global context" /* CustomerDataType.GlobalContext */);
    var userContextManager = createContextManager("user" /* CustomerDataType.User */);
    var getInternalContextStrategy = function () { return undefined; };
    var getInitConfigurationStrategy = function () { return undefined; };
    var stopSessionStrategy = noop;
    var getSessionReplayLinkStrategy = function () { return undefined; };
    var bufferApiCalls = new BoundedBuffer();
    var addTimingStrategy = function (name, time) {
        if (time === void 0) { time = timeStampNow(); }
        bufferApiCalls.add(function () { return addTimingStrategy(name, time); });
    };
    var startViewStrategy = function (options, startClocks) {
        if (startClocks === void 0) { startClocks = clocksNow(); }
        bufferApiCalls.add(function () { return startViewStrategy(options, startClocks); });
    };
    var addActionStrategy = function (action, commonContext) {
        if (commonContext === void 0) { commonContext = buildCommonContext(globalContextManager, userContextManager, recorderApi); }
        bufferApiCalls.add(function () { return addActionStrategy(action, commonContext); });
    };
    var addErrorStrategy = function (providedError, commonContext) {
        if (commonContext === void 0) { commonContext = buildCommonContext(globalContextManager, userContextManager, recorderApi); }
        bufferApiCalls.add(function () { return addErrorStrategy(providedError, commonContext); });
    };
    var addFeatureFlagEvaluationStrategy = function (key, value) {
        bufferApiCalls.add(function () { return addFeatureFlagEvaluationStrategy(key, value); });
    };
    function initRum(initConfiguration) {
        // This function should be available, regardless of initialization success.
        getInitConfigurationStrategy = function () { return deepClone(initConfiguration); };
        // If we are in a Synthetics test configured to automatically inject a RUM instance, we want to
        // completely discard the customer application RUM instance by ignoring their init() call.  But,
        // we should not ignore the init() call from the Synthetics-injected RUM instance, so the
        // internal `ignoreInitIfSyntheticsWillInjectRum` option is here to bypass this condition.
        if (ignoreInitIfSyntheticsWillInjectRum && willSyntheticsInjectRum()) {
            return;
        }
        var eventBridgeAvailable = canUseEventBridge();
        if (eventBridgeAvailable) {
            initConfiguration = overrideInitConfigurationForBridge(initConfiguration);
        }
        if (!canInitRum(initConfiguration)) {
            return;
        }
        var configuration = validateAndBuildRumConfiguration(initConfiguration);
        if (!configuration) {
            return;
        }
        if (!eventBridgeAvailable && !configuration.sessionStoreStrategyType) {
            display.warn('No storage available for session. We will not send any data.');
            return;
        }
        if (!configuration.trackViewsManually) {
            doStartRum(initConfiguration, configuration);
        }
        else {
            // drain beforeInitCalls by buffering them until we start RUM
            // if we get a startView, drain re-buffered calls before continuing to drain beforeInitCalls
            // in order to ensure that calls are processed in order
            var beforeInitCalls = bufferApiCalls;
            bufferApiCalls = new BoundedBuffer();
            startViewStrategy = function (options) {
                doStartRum(initConfiguration, configuration, options);
            };
            beforeInitCalls.drain();
        }
        isAlreadyInitialized = true;
    }
    function doStartRum(initConfiguration, configuration, initialViewOptions) {
        var startRumResults = startRumImpl(initConfiguration, configuration, recorderApi, globalContextManager, userContextManager, initialViewOptions);
        getSessionReplayLinkStrategy = function () {
            return recorderApi.getSessionReplayLink(configuration, startRumResults.session, startRumResults.viewContexts);
        };
        (startViewStrategy = startRumResults.startView, addActionStrategy = startRumResults.addAction, addErrorStrategy = startRumResults.addError, addTimingStrategy = startRumResults.addTiming, addFeatureFlagEvaluationStrategy = startRumResults.addFeatureFlagEvaluation, getInternalContextStrategy = startRumResults.getInternalContext, stopSessionStrategy = startRumResults.stopSession);
        bufferApiCalls.drain();
        recorderApi.onRumStart(startRumResults.lifeCycle, configuration, startRumResults.session, startRumResults.viewContexts);
    }
    var startView = monitor(function (options) {
        var sanitizedOptions = typeof options === 'object' ? options : { name: options };
        startViewStrategy(sanitizedOptions);
    });
    var rumPublicApi = makePublicApi({
        init: monitor(initRum),
        /** @deprecated: use setGlobalContextProperty instead */
        addRumGlobalContext: monitor(globalContextManager.add),
        setGlobalContextProperty: monitor(globalContextManager.setContextProperty),
        /** @deprecated: use removeGlobalContextProperty instead */
        removeRumGlobalContext: monitor(globalContextManager.remove),
        removeGlobalContextProperty: monitor(globalContextManager.removeContextProperty),
        /** @deprecated: use getGlobalContext instead */
        getRumGlobalContext: monitor(globalContextManager.get),
        getGlobalContext: monitor(globalContextManager.getContext),
        /** @deprecated: use setGlobalContext instead */
        setRumGlobalContext: monitor(globalContextManager.set),
        setGlobalContext: monitor(globalContextManager.setContext),
        clearGlobalContext: monitor(globalContextManager.clearContext),
        getInternalContext: monitor(function (startTime) { return getInternalContextStrategy(startTime); }),
        getInitConfiguration: monitor(function () { return getInitConfigurationStrategy(); }),
        addAction: monitor(function (name, context) {
            addActionStrategy({
                name: sanitize(name),
                context: sanitize(context),
                startClocks: clocksNow(),
                type: "custom" /* ActionType.CUSTOM */,
            });
        }),
        addError: function (error, context) {
            var handlingStack = createHandlingStack();
            callMonitored(function () {
                addErrorStrategy({
                    error: error,
                    handlingStack: handlingStack,
                    context: sanitize(context),
                    startClocks: clocksNow(),
                });
            });
        },
        addTiming: monitor(function (name, time) {
            addTimingStrategy(sanitize(name), time);
        }),
        setUser: monitor(function (newUser) {
            if (checkUser(newUser)) {
                userContextManager.setContext(sanitizeUser(newUser));
            }
        }),
        getUser: monitor(userContextManager.getContext),
        setUserProperty: monitor(function (key, property) {
            var _a;
            var sanitizedProperty = sanitizeUser((_a = {}, _a[key] = property, _a))[key];
            userContextManager.setContextProperty(key, sanitizedProperty);
        }),
        removeUserProperty: monitor(userContextManager.removeContextProperty),
        /** @deprecated: renamed to clearUser */
        removeUser: monitor(userContextManager.clearContext),
        clearUser: monitor(userContextManager.clearContext),
        startView: startView,
        stopSession: monitor(function () {
            stopSessionStrategy();
        }),
        startSessionReplayRecording: monitor(recorderApi.start),
        stopSessionReplayRecording: monitor(recorderApi.stop),
        /**
         * This feature is currently in beta. For more information see the full [feature flag tracking guide](https://docs.datadoghq.com/real_user_monitoring/feature_flag_tracking/).
         */
        addFeatureFlagEvaluation: monitor(function (key, value) {
            addFeatureFlagEvaluationStrategy(sanitize(key), sanitize(value));
        }),
        getSessionReplayLink: monitor(function () { return getSessionReplayLinkStrategy(); }),
    });
    return rumPublicApi;
    function canInitRum(initConfiguration) {
        if (isAlreadyInitialized) {
            if (!initConfiguration.silentMultipleInit) {
                display.error('DD_RUM is already initialized.');
            }
            return false;
        }
        return true;
    }
    function overrideInitConfigurationForBridge(initConfiguration) {
        return assign({}, initConfiguration, {
            applicationId: '00000000-aaaa-0000-aaaa-000000000000',
            clientToken: 'empty',
            sessionSampleRate: 100,
        });
    }
}
//# sourceMappingURL=rumPublicApi.js.map