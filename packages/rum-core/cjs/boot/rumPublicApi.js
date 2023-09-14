"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRumPublicApi = void 0;
var browser_core_1 = require("@datadog/browser-core");
var configuration_1 = require("../domain/configuration");
var commonContext_1 = require("../domain/contexts/commonContext");
var RUM_STORAGE_KEY = 'rum';
function makeRumPublicApi(startRumImpl, recorderApi, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.ignoreInitIfSyntheticsWillInjectRum, ignoreInitIfSyntheticsWillInjectRum = _c === void 0 ? true : _c;
    var isAlreadyInitialized = false;
    var globalContextManager = (0, browser_core_1.createContextManager)(2 /* CustomerDataType.GlobalContext */);
    var userContextManager = (0, browser_core_1.createContextManager)(1 /* CustomerDataType.User */);
    var getInternalContextStrategy = function () { return undefined; };
    var getInitConfigurationStrategy = function () { return undefined; };
    var stopSessionStrategy = browser_core_1.noop;
    var getSessionReplayLinkStrategy = function () { return undefined; };
    var bufferApiCalls = new browser_core_1.BoundedBuffer();
    var addTimingStrategy = function (name, time) {
        if (time === void 0) { time = (0, browser_core_1.timeStampNow)(); }
        bufferApiCalls.add(function () { return addTimingStrategy(name, time); });
    };
    var startViewStrategy = function (options, startClocks) {
        if (startClocks === void 0) { startClocks = (0, browser_core_1.clocksNow)(); }
        bufferApiCalls.add(function () { return startViewStrategy(options, startClocks); });
    };
    var addActionStrategy = function (action, commonContext) {
        if (commonContext === void 0) { commonContext = (0, commonContext_1.buildCommonContext)(globalContextManager, userContextManager, recorderApi); }
        bufferApiCalls.add(function () { return addActionStrategy(action, commonContext); });
    };
    var addErrorStrategy = function (providedError, commonContext) {
        if (commonContext === void 0) { commonContext = (0, commonContext_1.buildCommonContext)(globalContextManager, userContextManager, recorderApi); }
        bufferApiCalls.add(function () { return addErrorStrategy(providedError, commonContext); });
    };
    var addFeatureFlagEvaluationStrategy = function (key, value) {
        bufferApiCalls.add(function () { return addFeatureFlagEvaluationStrategy(key, value); });
    };
    function initRum(initConfiguration) {
        if (!initConfiguration) {
            browser_core_1.display.error('Missing configuration');
            return;
        }
        // This function should be available, regardless of initialization success.
        getInitConfigurationStrategy = function () { return (0, browser_core_1.deepClone)(initConfiguration); };
        // If we are in a Synthetics test configured to automatically inject a RUM instance, we want to
        // completely discard the customer application RUM instance by ignoring their init() call.  But,
        // we should not ignore the init() call from the Synthetics-injected RUM instance, so the
        // internal `ignoreInitIfSyntheticsWillInjectRum` option is here to bypass this condition.
        if (ignoreInitIfSyntheticsWillInjectRum && (0, browser_core_1.willSyntheticsInjectRum)()) {
            return;
        }
        var eventBridgeAvailable = (0, browser_core_1.canUseEventBridge)();
        if (eventBridgeAvailable) {
            initConfiguration = overrideInitConfigurationForBridge(initConfiguration);
        }
        if (!canInitRum(initConfiguration)) {
            return;
        }
        var configuration = (0, configuration_1.validateAndBuildRumConfiguration)(initConfiguration);
        if (!configuration) {
            return;
        }
        if (!eventBridgeAvailable && !configuration.sessionStoreStrategyType) {
            browser_core_1.display.warn('No storage available for session. We will not send any data.');
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
            bufferApiCalls = new browser_core_1.BoundedBuffer();
            startViewStrategy = function (options) {
                doStartRum(initConfiguration, configuration, options);
            };
            beforeInitCalls.drain();
        }
        isAlreadyInitialized = true;
    }
    function doStartRum(initConfiguration, configuration, initialViewOptions) {
        if (initConfiguration.storeContextsAcrossPages) {
            var beforeInitGlobalContext = globalContextManager.getContext();
            globalContextManager = (0, browser_core_1.createStoredContextManager)(configuration, RUM_STORAGE_KEY, 2 /* CustomerDataType.GlobalContext */);
            globalContextManager.setContext((0, browser_core_1.combine)(globalContextManager.getContext(), beforeInitGlobalContext));
            var beforeInitUserContext = userContextManager.getContext();
            userContextManager = (0, browser_core_1.createStoredContextManager)(configuration, RUM_STORAGE_KEY, 1 /* CustomerDataType.User */);
            userContextManager.setContext((0, browser_core_1.combine)(userContextManager.getContext(), beforeInitUserContext));
        }
        var startRumResults = startRumImpl(initConfiguration, configuration, recorderApi, globalContextManager, userContextManager, initialViewOptions);
        getSessionReplayLinkStrategy = function () {
            return recorderApi.getSessionReplayLink(configuration, startRumResults.session, startRumResults.viewContexts);
        };
        (startViewStrategy = startRumResults.startView, addActionStrategy = startRumResults.addAction, addErrorStrategy = startRumResults.addError, addTimingStrategy = startRumResults.addTiming, addFeatureFlagEvaluationStrategy = startRumResults.addFeatureFlagEvaluation, getInternalContextStrategy = startRumResults.getInternalContext, stopSessionStrategy = startRumResults.stopSession);
        bufferApiCalls.drain();
        recorderApi.onRumStart(startRumResults.lifeCycle, configuration, startRumResults.session, startRumResults.viewContexts);
    }
    var startView = (0, browser_core_1.monitor)(function (options) {
        var sanitizedOptions = typeof options === 'object' ? options : { name: options };
        startViewStrategy(sanitizedOptions);
    });
    var rumPublicApi = (0, browser_core_1.makePublicApi)({
        init: (0, browser_core_1.monitor)(initRum),
        /** @deprecated: use setGlobalContextProperty instead */
        addRumGlobalContext: (0, browser_core_1.monitor)(function (key, value) { return globalContextManager.add(key, value); }),
        setGlobalContextProperty: (0, browser_core_1.monitor)(function (key, value) { return globalContextManager.setContextProperty(key, value); }),
        /** @deprecated: use removeGlobalContextProperty instead */
        removeRumGlobalContext: (0, browser_core_1.monitor)(function (key) { return globalContextManager.remove(key); }),
        removeGlobalContextProperty: (0, browser_core_1.monitor)(function (key) { return globalContextManager.removeContextProperty(key); }),
        /** @deprecated: use getGlobalContext instead */
        getRumGlobalContext: (0, browser_core_1.monitor)(function () { return globalContextManager.get(); }),
        getGlobalContext: (0, browser_core_1.monitor)(function () { return globalContextManager.getContext(); }),
        /** @deprecated: use setGlobalContext instead */
        setRumGlobalContext: (0, browser_core_1.monitor)(function (context) { return globalContextManager.set(context); }),
        setGlobalContext: (0, browser_core_1.monitor)(function (context) { return globalContextManager.setContext(context); }),
        clearGlobalContext: (0, browser_core_1.monitor)(function () { return globalContextManager.clearContext(); }),
        getInternalContext: (0, browser_core_1.monitor)(function (startTime) { return getInternalContextStrategy(startTime); }),
        getInitConfiguration: (0, browser_core_1.monitor)(function () { return getInitConfigurationStrategy(); }),
        addAction: (0, browser_core_1.monitor)(function (name, context) {
            addActionStrategy({
                name: (0, browser_core_1.sanitize)(name),
                context: (0, browser_core_1.sanitize)(context),
                startClocks: (0, browser_core_1.clocksNow)(),
                type: "custom" /* ActionType.CUSTOM */,
            });
        }),
        addError: function (error, context) {
            var handlingStack = (0, browser_core_1.createHandlingStack)();
            (0, browser_core_1.callMonitored)(function () {
                addErrorStrategy({
                    error: error,
                    handlingStack: handlingStack,
                    context: (0, browser_core_1.sanitize)(context),
                    startClocks: (0, browser_core_1.clocksNow)(),
                });
            });
        },
        addTiming: (0, browser_core_1.monitor)(function (name, time) {
            addTimingStrategy((0, browser_core_1.sanitize)(name), time);
        }),
        setUser: (0, browser_core_1.monitor)(function (newUser) {
            if ((0, browser_core_1.checkUser)(newUser)) {
                userContextManager.setContext((0, browser_core_1.sanitizeUser)(newUser));
            }
        }),
        getUser: (0, browser_core_1.monitor)(function () { return userContextManager.getContext(); }),
        setUserProperty: (0, browser_core_1.monitor)(function (key, property) {
            var _a;
            var sanitizedProperty = (0, browser_core_1.sanitizeUser)((_a = {}, _a[key] = property, _a))[key];
            userContextManager.setContextProperty(key, sanitizedProperty);
        }),
        removeUserProperty: (0, browser_core_1.monitor)(function (key) { return userContextManager.removeContextProperty(key); }),
        /** @deprecated: renamed to clearUser */
        removeUser: (0, browser_core_1.monitor)(function () { return userContextManager.clearContext(); }),
        clearUser: (0, browser_core_1.monitor)(function () { return userContextManager.clearContext(); }),
        startView: startView,
        stopSession: (0, browser_core_1.monitor)(function () {
            stopSessionStrategy();
        }),
        startSessionReplayRecording: (0, browser_core_1.monitor)(recorderApi.start),
        stopSessionReplayRecording: (0, browser_core_1.monitor)(recorderApi.stop),
        /**
         * This feature is currently in beta. For more information see the full [feature flag tracking guide](https://docs.datadoghq.com/real_user_monitoring/feature_flag_tracking/).
         */
        addFeatureFlagEvaluation: (0, browser_core_1.monitor)(function (key, value) {
            addFeatureFlagEvaluationStrategy((0, browser_core_1.sanitize)(key), (0, browser_core_1.sanitize)(value));
        }),
        getSessionReplayLink: (0, browser_core_1.monitor)(function () { return getSessionReplayLinkStrategy(); }),
    });
    return rumPublicApi;
    function canInitRum(initConfiguration) {
        if (isAlreadyInitialized) {
            if (!initConfiguration.silentMultipleInit) {
                browser_core_1.display.error('DD_RUM is already initialized.');
            }
            return false;
        }
        return true;
    }
    function overrideInitConfigurationForBridge(initConfiguration) {
        return (0, browser_core_1.assign)({}, initConfiguration, {
            applicationId: '00000000-aaaa-0000-aaaa-000000000000',
            clientToken: 'empty',
            sessionSampleRate: 100,
        });
    }
}
exports.makeRumPublicApi = makeRumPublicApi;
//# sourceMappingURL=rumPublicApi.js.map