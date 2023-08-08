"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.STATUSES = exports.HandlerType = exports.StatusType = void 0;
var browser_core_1 = require("@datadog/browser-core");
exports.StatusType = {
    debug: 'debug',
    error: 'error',
    info: 'info',
    warn: 'warn',
};
exports.HandlerType = {
    console: 'console',
    http: 'http',
    silent: 'silent',
};
exports.STATUSES = Object.keys(exports.StatusType);
var Logger = exports.Logger = /** @class */ (function () {
    function Logger(handleLogStrategy, name, handlerType, level, loggerContext) {
        if (handlerType === void 0) { handlerType = exports.HandlerType.http; }
        if (level === void 0) { level = exports.StatusType.debug; }
        if (loggerContext === void 0) { loggerContext = {}; }
        this.handleLogStrategy = handleLogStrategy;
        this.handlerType = handlerType;
        this.level = level;
        this.contextManager = (0, browser_core_1.createContextManager)("logger context" /* CustomerDataType.LoggerContext */);
        this.contextManager.set((0, browser_core_1.assign)({}, loggerContext, name ? { logger: { name: name } } : undefined));
    }
    Logger.prototype.log = function (message, messageContext, status, error) {
        if (status === void 0) { status = exports.StatusType.info; }
        var errorContext;
        if (status === exports.StatusType.error) {
            // Always add origin if status is error (backward compatibility - Remove in next major)
            errorContext = { origin: browser_core_1.ErrorSource.LOGGER };
        }
        if (error !== undefined && error !== null) {
            var stackTrace = error instanceof Error ? (0, browser_core_1.computeStackTrace)(error) : undefined;
            var rawError = (0, browser_core_1.computeRawError)({
                stackTrace: stackTrace,
                originalError: error,
                nonErrorPrefix: "Provided" /* NonErrorPrefix.PROVIDED */,
                source: browser_core_1.ErrorSource.LOGGER,
                handling: "handled" /* ErrorHandling.HANDLED */,
                startClocks: (0, browser_core_1.clocksNow)(),
            });
            errorContext = {
                origin: browser_core_1.ErrorSource.LOGGER,
                stack: rawError.stack,
                kind: rawError.type,
                message: rawError.message,
            };
        }
        var sanitizedMessageContext = (0, browser_core_1.sanitize)(messageContext);
        var context = errorContext
            ? (0, browser_core_1.combine)({ error: errorContext }, sanitizedMessageContext)
            : sanitizedMessageContext;
        this.handleLogStrategy({
            message: (0, browser_core_1.sanitize)(message),
            context: context,
            status: status,
        }, this);
    };
    Logger.prototype.debug = function (message, messageContext, error) {
        this.log(message, messageContext, exports.StatusType.debug, error);
    };
    Logger.prototype.info = function (message, messageContext, error) {
        this.log(message, messageContext, exports.StatusType.info, error);
    };
    Logger.prototype.warn = function (message, messageContext, error) {
        this.log(message, messageContext, exports.StatusType.warn, error);
    };
    Logger.prototype.error = function (message, messageContext, error) {
        this.log(message, messageContext, exports.StatusType.error, error);
    };
    Logger.prototype.setContext = function (context) {
        this.contextManager.set(context);
    };
    Logger.prototype.getContext = function () {
        return this.contextManager.get();
    };
    Logger.prototype.addContext = function (key, value) {
        this.contextManager.add(key, value);
    };
    Logger.prototype.removeContext = function (key) {
        this.contextManager.remove(key);
    };
    Logger.prototype.setHandler = function (handler) {
        this.handlerType = handler;
    };
    Logger.prototype.getHandler = function () {
        return this.handlerType;
    };
    Logger.prototype.setLevel = function (level) {
        this.level = level;
    };
    Logger.prototype.getLevel = function () {
        return this.level;
    };
    __decorate([
        browser_core_1.monitored
    ], Logger.prototype, "log", null);
    return Logger;
}());
//# sourceMappingURL=logger.js.map