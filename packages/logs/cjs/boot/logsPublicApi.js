"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeLogsPublicApi = void 0;
var browser_core_1 = require("@datadog/browser-core");
var configuration_1 = require("../domain/configuration");
var logger_1 = require("../domain/logger");
function makeLogsPublicApi(startLogsImpl) {
    var isAlreadyInitialized = false;
    var globalContextManager = (0, browser_core_1.createContextManager)("global context" /* CustomerDataType.GlobalContext */);
    var userContextManager = (0, browser_core_1.createContextManager)("user" /* CustomerDataType.User */);
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
            ;
            (_a = startLogsImpl(initConfiguration, configuration, buildCommonContext, mainLogger), handleLogStrategy = _a.handleLog, getInternalContextStrategy = _a.getInternalContext);
            beforeInitLoggerLog.drain();
            isAlreadyInitialized = true;
        }),
        /** @deprecated: use getGlobalContext instead */
        getLoggerGlobalContext: (0, browser_core_1.monitor)(globalContextManager.get),
        getGlobalContext: (0, browser_core_1.monitor)(globalContextManager.getContext),
        /** @deprecated: use setGlobalContext instead */
        setLoggerGlobalContext: (0, browser_core_1.monitor)(globalContextManager.set),
        setGlobalContext: (0, browser_core_1.monitor)(globalContextManager.setContext),
        /** @deprecated: use setGlobalContextProperty instead */
        addLoggerGlobalContext: (0, browser_core_1.monitor)(globalContextManager.add),
        setGlobalContextProperty: (0, browser_core_1.monitor)(globalContextManager.setContextProperty),
        /** @deprecated: use removeGlobalContextProperty instead */
        removeLoggerGlobalContext: (0, browser_core_1.monitor)(globalContextManager.remove),
        removeGlobalContextProperty: (0, browser_core_1.monitor)(globalContextManager.removeContextProperty),
        clearGlobalContext: (0, browser_core_1.monitor)(globalContextManager.clearContext),
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
        getUser: (0, browser_core_1.monitor)(userContextManager.getContext),
        setUserProperty: (0, browser_core_1.monitor)(function (key, property) {
            var _a;
            var sanitizedProperty = (0, browser_core_1.sanitizeUser)((_a = {}, _a[key] = property, _a))[key];
            userContextManager.setContextProperty(key, sanitizedProperty);
        }),
        removeUserProperty: (0, browser_core_1.monitor)(userContextManager.removeContextProperty),
        clearUser: (0, browser_core_1.monitor)(userContextManager.clearContext),
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