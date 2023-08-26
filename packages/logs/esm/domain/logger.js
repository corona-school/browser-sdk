var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { clocksNow, computeRawError, computeStackTrace, assign, combine, createContextManager, ErrorSource, monitored, sanitize, } from '@datadog/browser-core';
export var StatusType = {
    debug: 'debug',
    error: 'error',
    info: 'info',
    warn: 'warn',
};
export var HandlerType = {
    console: 'console',
    http: 'http',
    silent: 'silent',
};
export var STATUSES = Object.keys(StatusType);
export var Logger = /** @class */ (function () {
    function Logger(handleLogStrategy, name, handlerType, level, loggerContext) {
        if (handlerType === void 0) { handlerType = HandlerType.http; }
        if (level === void 0) { level = StatusType.debug; }
        if (loggerContext === void 0) { loggerContext = {}; }
        this.handleLogStrategy = handleLogStrategy;
        this.handlerType = handlerType;
        this.level = level;
        this.contextManager = createContextManager("logger context" /* CustomerDataType.LoggerContext */);
        this.contextManager.set(assign({}, loggerContext, name ? { logger: { name: name } } : undefined));
    }
    Logger.prototype.log = function (message, messageContext, status, error) {
        if (status === void 0) { status = StatusType.info; }
        var errorContext;
        if (status === StatusType.error) {
            // Always add origin if status is error (backward compatibility - Remove in next major)
            errorContext = { origin: ErrorSource.LOGGER };
        }
        if (error !== undefined && error !== null) {
            var stackTrace = error instanceof Error ? computeStackTrace(error) : undefined;
            var rawError = computeRawError({
                stackTrace: stackTrace,
                originalError: error,
                nonErrorPrefix: "Provided" /* NonErrorPrefix.PROVIDED */,
                source: ErrorSource.LOGGER,
                handling: "handled" /* ErrorHandling.HANDLED */,
                startClocks: clocksNow(),
            });
            errorContext = {
                origin: ErrorSource.LOGGER,
                stack: rawError.stack,
                kind: rawError.type,
                message: rawError.message,
            };
        }
        var sanitizedMessageContext = sanitize(messageContext);
        var context = errorContext
            ? combine({ error: errorContext }, sanitizedMessageContext)
            : sanitizedMessageContext;
        this.handleLogStrategy({
            message: sanitize(message),
            context: context,
            status: status,
        }, this);
    };
    Logger.prototype.debug = function (message, messageContext, error) {
        this.log(message, messageContext, StatusType.debug, error);
    };
    Logger.prototype.info = function (message, messageContext, error) {
        this.log(message, messageContext, StatusType.info, error);
    };
    Logger.prototype.warn = function (message, messageContext, error) {
        this.log(message, messageContext, StatusType.warn, error);
    };
    Logger.prototype.error = function (message, messageContext, error) {
        this.log(message, messageContext, StatusType.error, error);
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
        monitored
    ], Logger.prototype, "log", null);
    return Logger;
}());
//# sourceMappingURL=logger.js.map