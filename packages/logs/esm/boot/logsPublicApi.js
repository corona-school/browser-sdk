import { assign, BoundedBuffer, createContextManager, makePublicApi, monitor, display, deepClone, canUseEventBridge, timeStampNow, checkUser, sanitizeUser, sanitize, createStoredContextManager, combine, } from '@datadog/browser-core';
import { validateAndBuildLogsConfiguration } from '../domain/configuration';
import { Logger } from '../domain/logger';
var LOGS_STORAGE_KEY = 'logs';
export function makeLogsPublicApi(startLogsImpl) {
    var isAlreadyInitialized = false;
    var globalContextManager = createContextManager(2 /* CustomerDataType.GlobalContext */);
    var userContextManager = createContextManager(1 /* CustomerDataType.User */);
    var customLoggers = {};
    var getInternalContextStrategy = function () { return undefined; };
    var beforeInitLoggerLog = new BoundedBuffer();
    var handleLogStrategy = function (logsMessage, logger, savedCommonContext, date) {
        if (savedCommonContext === void 0) { savedCommonContext = deepClone(buildCommonContext()); }
        if (date === void 0) { date = timeStampNow(); }
        beforeInitLoggerLog.add(function () { return handleLogStrategy(logsMessage, logger, savedCommonContext, date); });
    };
    var getInitConfigurationStrategy = function () { return undefined; };
    var mainLogger = new Logger(function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        return handleLogStrategy.apply(void 0, params);
    });
    function buildCommonContext() {
        return {
            view: {
                referrer: document.referrer,
                url: window.location.href,
            },
            context: globalContextManager.getContext(),
            user: userContextManager.getContext(),
        };
    }
    return makePublicApi({
        logger: mainLogger,
        init: monitor(function (initConfiguration) {
            var _a;
            if (!initConfiguration) {
                display.error('Missing configuration');
                return;
            }
            // This function should be available, regardless of initialization success.
            getInitConfigurationStrategy = function () { return deepClone(initConfiguration); };
            if (canUseEventBridge()) {
                initConfiguration = overrideInitConfigurationForBridge(initConfiguration);
            }
            if (!canInitLogs(initConfiguration)) {
                return;
            }
            var configuration = validateAndBuildLogsConfiguration(initConfiguration);
            if (!configuration) {
                return;
            }
            if (initConfiguration.storeContextsAcrossPages) {
                var beforeInitGlobalContext = globalContextManager.getContext();
                globalContextManager = createStoredContextManager(configuration, LOGS_STORAGE_KEY, 2 /* CustomerDataType.GlobalContext */);
                globalContextManager.setContext(combine(globalContextManager.getContext(), beforeInitGlobalContext));
                var beforeInitUserContext = userContextManager.getContext();
                userContextManager = createStoredContextManager(configuration, LOGS_STORAGE_KEY, 1 /* CustomerDataType.User */);
                userContextManager.setContext(combine(userContextManager.getContext(), beforeInitUserContext));
            }
            ;
            (_a = startLogsImpl(initConfiguration, configuration, buildCommonContext, mainLogger), handleLogStrategy = _a.handleLog, getInternalContextStrategy = _a.getInternalContext);
            beforeInitLoggerLog.drain();
            isAlreadyInitialized = true;
        }),
        /** @deprecated: use getGlobalContext instead */
        getLoggerGlobalContext: monitor(function () { return globalContextManager.get(); }),
        getGlobalContext: monitor(function () { return globalContextManager.getContext(); }),
        /** @deprecated: use setGlobalContext instead */
        setLoggerGlobalContext: monitor(function (context) { return globalContextManager.set(context); }),
        setGlobalContext: monitor(function (context) { return globalContextManager.setContext(context); }),
        /** @deprecated: use setGlobalContextProperty instead */
        addLoggerGlobalContext: monitor(function (key, value) { return globalContextManager.add(key, value); }),
        setGlobalContextProperty: monitor(function (key, value) { return globalContextManager.setContextProperty(key, value); }),
        /** @deprecated: use removeGlobalContextProperty instead */
        removeLoggerGlobalContext: monitor(function (key) { return globalContextManager.remove(key); }),
        removeGlobalContextProperty: monitor(function (key) { return globalContextManager.removeContextProperty(key); }),
        clearGlobalContext: monitor(function () { return globalContextManager.clearContext(); }),
        createLogger: monitor(function (name, conf) {
            if (conf === void 0) { conf = {}; }
            customLoggers[name] = new Logger(function () {
                var params = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    params[_i] = arguments[_i];
                }
                return handleLogStrategy.apply(void 0, params);
            }, sanitize(name), conf.handler, conf.level, sanitize(conf.context));
            return customLoggers[name];
        }),
        getLogger: monitor(function (name) { return customLoggers[name]; }),
        getInitConfiguration: monitor(function () { return getInitConfigurationStrategy(); }),
        getInternalContext: monitor(function (startTime) { return getInternalContextStrategy(startTime); }),
        setUser: monitor(function (newUser) {
            if (checkUser(newUser)) {
                userContextManager.setContext(sanitizeUser(newUser));
            }
        }),
        getUser: monitor(function () { return userContextManager.getContext(); }),
        setUserProperty: monitor(function (key, property) {
            var _a;
            var sanitizedProperty = sanitizeUser((_a = {}, _a[key] = property, _a))[key];
            userContextManager.setContextProperty(key, sanitizedProperty);
        }),
        removeUserProperty: monitor(function (key) { return userContextManager.removeContextProperty(key); }),
        clearUser: monitor(function () { return userContextManager.clearContext(); }),
    });
    function overrideInitConfigurationForBridge(initConfiguration) {
        return assign({}, initConfiguration, { clientToken: 'empty' });
    }
    function canInitLogs(initConfiguration) {
        if (isAlreadyInitialized) {
            if (!initConfiguration.silentMultipleInit) {
                display.error('DD_LOGS is already initialized.');
            }
            return false;
        }
        return true;
    }
}
//# sourceMappingURL=logsPublicApi.js.map