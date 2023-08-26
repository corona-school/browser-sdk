"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrubCustomerFrames = exports.formatError = exports.addTelemetryConfiguration = exports.addTelemetryError = exports.addTelemetryDebug = exports.isTelemetryReplicationAllowed = exports.resetTelemetry = exports.startFakeTelemetry = exports.startTelemetry = void 0;
var display_1 = require("../../tools/display");
var error_1 = require("../error/error");
var experimentalFeatures_1 = require("../../tools/experimentalFeatures");
var configuration_1 = require("../configuration");
var tracekit_1 = require("../tracekit");
var observable_1 = require("../../tools/observable");
var timeUtils_1 = require("../../tools/utils/timeUtils");
var monitor_1 = require("../../tools/monitor");
var sendToExtension_1 = require("../../tools/sendToExtension");
var polyfills_1 = require("../../tools/utils/polyfills");
var numberUtils_1 = require("../../tools/utils/numberUtils");
var jsonStringify_1 = require("../../tools/serialisation/jsonStringify");
var mergeInto_1 = require("../../tools/mergeInto");
var rawTelemetryEvent_types_1 = require("./rawTelemetryEvent.types");
var ALLOWED_FRAME_URLS = [
    'https://www.datadoghq-browser-agent.com',
    'https://www.datad0g-browser-agent.com',
    'https://d3uc069fcn7uxw.cloudfront.net',
    'https://d20xtzwzcl0ceb.cloudfront.net',
    'http://localhost',
    '<anonymous>',
];
var TELEMETRY_EXCLUDED_SITES = [configuration_1.INTAKE_SITE_US1_FED];
var telemetryConfiguration = { maxEventsPerPage: 0, sentEventCount: 0, telemetryEnabled: false, telemetryConfigurationEnabled: false };
var onRawTelemetryEventCollected;
function startTelemetry(telemetryService, configuration) {
    var contextProvider;
    var observable = new observable_1.Observable();
    telemetryConfiguration.telemetryEnabled =
        !(0, polyfills_1.includes)(TELEMETRY_EXCLUDED_SITES, configuration.site) && (0, numberUtils_1.performDraw)(configuration.telemetrySampleRate);
    telemetryConfiguration.telemetryConfigurationEnabled =
        telemetryConfiguration.telemetryEnabled && (0, numberUtils_1.performDraw)(configuration.telemetryConfigurationSampleRate);
    onRawTelemetryEventCollected = function (rawEvent) {
        if (telemetryConfiguration.telemetryEnabled) {
            var event_1 = toTelemetryEvent(telemetryService, rawEvent);
            observable.notify(event_1);
            (0, sendToExtension_1.sendToExtension)('telemetry', event_1);
        }
    };
    (0, monitor_1.startMonitorErrorCollection)(addTelemetryError);
    (0, polyfills_1.assign)(telemetryConfiguration, {
        maxEventsPerPage: configuration.maxTelemetryEventsPerPage,
        sentEventCount: 0,
    });
    function toTelemetryEvent(telemetryService, event) {
        return (0, mergeInto_1.combine)({
            type: 'telemetry',
            date: (0, timeUtils_1.timeStampNow)(),
            service: telemetryService,
            version: "dev",
            source: 'browser',
            _dd: {
                format_version: 2,
            },
            telemetry: event,
            experimental_features: (0, polyfills_1.arrayFrom)((0, experimentalFeatures_1.getExperimentalFeatures)()),
        }, contextProvider !== undefined ? contextProvider() : {});
    }
    return {
        setContextProvider: function (provider) {
            contextProvider = provider;
        },
        observable: observable,
        enabled: telemetryConfiguration.telemetryEnabled,
    };
}
exports.startTelemetry = startTelemetry;
function startFakeTelemetry() {
    var events = [];
    (0, polyfills_1.assign)(telemetryConfiguration, {
        maxEventsPerPage: Infinity,
        sentEventCount: 0,
    });
    onRawTelemetryEventCollected = function (event) {
        events.push(event);
    };
    return events;
}
exports.startFakeTelemetry = startFakeTelemetry;
function resetTelemetry() {
    onRawTelemetryEventCollected = undefined;
}
exports.resetTelemetry = resetTelemetry;
/**
 * Avoid mixing telemetry events from different data centers
 * but keep replicating staging events for reliability
 */
function isTelemetryReplicationAllowed(configuration) {
    return configuration.site === configuration_1.INTAKE_SITE_STAGING;
}
exports.isTelemetryReplicationAllowed = isTelemetryReplicationAllowed;
function addTelemetryDebug(message, context) {
    (0, monitor_1.displayIfDebugEnabled)(display_1.ConsoleApiName.debug, message, context);
    addTelemetry((0, polyfills_1.assign)({
        type: rawTelemetryEvent_types_1.TelemetryType.log,
        message: message,
        status: "debug" /* StatusType.debug */,
    }, context));
}
exports.addTelemetryDebug = addTelemetryDebug;
function addTelemetryError(e, context) {
    addTelemetry((0, polyfills_1.assign)({
        type: rawTelemetryEvent_types_1.TelemetryType.log,
        status: "error" /* StatusType.error */,
    }, formatError(e), context));
}
exports.addTelemetryError = addTelemetryError;
function addTelemetryConfiguration(configuration) {
    if (telemetryConfiguration.telemetryConfigurationEnabled) {
        addTelemetry({
            type: rawTelemetryEvent_types_1.TelemetryType.configuration,
            configuration: configuration,
        });
    }
}
exports.addTelemetryConfiguration = addTelemetryConfiguration;
function addTelemetry(event) {
    if (onRawTelemetryEventCollected && telemetryConfiguration.sentEventCount < telemetryConfiguration.maxEventsPerPage) {
        telemetryConfiguration.sentEventCount += 1;
        onRawTelemetryEventCollected(event);
    }
}
function formatError(e) {
    if (e instanceof Error) {
        var stackTrace = (0, tracekit_1.computeStackTrace)(e);
        return {
            error: {
                kind: stackTrace.name,
                stack: (0, error_1.toStackTraceString)(scrubCustomerFrames(stackTrace)),
            },
            message: stackTrace.message,
        };
    }
    return {
        error: {
            stack: error_1.NO_ERROR_STACK_PRESENT_MESSAGE,
        },
        message: "".concat("Uncaught" /* NonErrorPrefix.UNCAUGHT */, " ").concat((0, jsonStringify_1.jsonStringify)(e)),
    };
}
exports.formatError = formatError;
function scrubCustomerFrames(stackTrace) {
    stackTrace.stack = stackTrace.stack.filter(function (frame) { return !frame.url || ALLOWED_FRAME_URLS.some(function (allowedFrameUrl) { return (0, polyfills_1.startsWith)(frame.url, allowedFrameUrl); }); });
    return stackTrace;
}
exports.scrubCustomerFrames = scrubCustomerFrames;
//# sourceMappingURL=telemetry.js.map