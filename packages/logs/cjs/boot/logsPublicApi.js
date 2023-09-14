"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeLogsPublicApi = void 0;
var browser_core_1 = require("@datadog/browser-core");
var configuration_1 = require("../domain/configuration");
var logger_1 = require("../domain/logger");
var LOGS_STORAGE_KEY = 'logs';
function makeLogsPublicApi(startLogsImpl) {
    var isAlreadyInitialized = false;
    var globalContextManager = (0, browser_core_1.createContextManager)(2 /* CustomerDataType.GlobalContext */);
    var userContextManager = (0, browser_core_1.createContextManager)(1 /* CustomerDataType.User */);
    var customLoggers = {};
    var getInternalContextStrategy = function () { return undefined; };
    var beforeInitLoggerLog = new browser_core_1.BoundedBuffer();
    var handleLogStrategy = function (logsMessage, logger, savedCommonContext, date) {
        if (savedCommonContext === void 0) { savedCommonContext = (0, browser_core_1.deepClone)(buildCommonContext()); }
        if (date === void 0) { date = (0, browser_core_1.timeStampNow)(); }
        beforeInitLoggerLog.add(function () { return handleLogStrategy(logsMessage, logger, savedCommonContext, date); });
    };
    var getInitConfigurationStrategy = function () { return undefined; };
    var mainLogger = new logger_1.Logger(function () {
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
    return (0, browser_core_1.makePublicApi)({
        logger: mainLogger,
        init: (0, browser_core_1.monitor)(function (initConfiguration) {
            var _a;
            if (!initConfiguration) {
                browser_core_1.display.error('Missing configuration');
                return;
            }
            // This function should be available, regardless of initialization success.
            getInitConfigurationStrategy = function () { return (0, browser_core_1.deepClone)(initConfiguration); };
            if ((0, browser_core_1.canUseEventBridge)()) {
                initConfiguration = overrideInitConfigurationForBridge(initConfiguration);
            }
            if (!canInitLogs(initConfiguration)) {
                return;
            }
            var configuration = (0, configuration_1.validateAndBuildLogsConfiguration)(initConfiguration);
            if (!configuration) {
                return;
            }
            if (initConfiguration.storeContextsAcrossPages) {
                var beforeInitGlobalContext = globalContextManager.getContext();
                globalContextManager = (0, browser_core_1.createStoredContextManager)(configuration, LOGS_STORAGE_KEY, 2 /* CustomerDataType.GlobalContext */);
                globalContextManager.setContext((0, browser_core_1.combine)(globalContextManager.getContext(), beforeInitGlobalContext));
                var beforeInitUserContext = userContextManager.getContext();
                userContextManager = (0, browser_core_1.createStoredContextManager)(configuration, LOGS_STORAGE_KEY, 1 /* CustomerDataType.User */);
                userContextManager.setContext((0, browser_core_1.combine)(userContextManager.getContext(), beforeInitUserContext));
            }
            ;
            (_a = startLogsImpl(initConfiguration, configuration, buildCommonContext, mainLogger), handleLogStrategy = _a.handleLog, getInternalContextStrategy = _a.getInternalContext);
            beforeInitLoggerLog.drain();
            isAlreadyInitialized = true;
        }),
        /** @deprecated: use getGlobalContext instead */
        getLoggerGlobalContext: (0, browser_core_1.monitor)(function () { return globalContextManager.get(); }),
        getGlobalContext: (0, browser_core_1.monitor)(function () { return globalContextManager.getContext(); }),
        /** @deprecated: use setGlobalContext instead */
        setLoggerGlobalContext: (0, browser_core_1.monitor)(function (context) { return globalContextManager.set(context); }),
        setGlobalContext: (0, browser_core_1.monitor)(function (context) { return globalContextManager.setContext(context); }),
        /** @deprecated: use setGlobalContextProperty instead */
        addLoggerGlobalContext: (0, browser_core_1.monitor)(function (key, value) { return globalContextManager.add(key, value); }),
        setGlobalContextProperty: (0, browser_core_1.monitor)(function (key, value) { return globalContextManager.setContextProperty(key, value); }),
        /** @deprecated: use removeGlobalContextProperty instead */
        removeLoggerGlobalContext: (0, browser_core_1.monitor)(function (key) { return globalContextManager.remove(key); }),
        removeGlobalContextProperty: (0, browser_core_1.monitor)(function (key) { return globalContextManager.removeContextProperty(key); }),
        clearGlobalContext: (0, browser_core_1.monitor)(function () { return globalContextManager.clearContext(); }),
        createLogger: (0, browser_core_1.monitor)(function (name, conf) {
            if (conf === void 0) { conf = {}; }
            customLoggers[name] = new logger_1.Logger(function () {
                var params = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    params[_i] = arguments[_i];
                }
                return handleLogStrategy.apply(void 0, params);
            }, (0, browser_core_1.sanitize)(name), conf.handler, conf.level, (0, browser_core_1.sanitize)(conf.context));
            return customLoggers[name];
        }),
        getLogger: (0, browser_core_1.monitor)(function (name) { return customLoggers[name]; }),
        getInitConfiguration: (0, browser_core_1.monitor)(function () { return getInitConfigurationStrategy(); }),
        getInternalContext: (0, browser_core_1.monitor)(function (startTime) { return getInternalContextStrategy(startTime); }),
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
        clearUser: (0, browser_core_1.monitor)(function () { return userContextManager.clearContext(); }),
    });
    function overrideInitConfigurationForBridge(initConfiguration) {
        return (0, browser_core_1.assign)({}, initConfiguration, { clientToken: 'empty' });
    }
    function canInitLogs(initConfiguration) {
        if (isAlreadyInitialized) {
            if (!initConfiguration.silentMultipleInit) {
                browser_core_1.display.error('DD_LOGS is already initialized.');
            }
            return false;
        }
        return true;
    }
}
exports.makeLogsPublicApi = makeLogsPublicApi;
//# sourceMappingURL=logsPublicApi.js.map