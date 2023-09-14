"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initReportObservable = exports.RawReportType = void 0;
var error_1 = require("../error/error");
var monitor_1 = require("../../tools/monitor");
var observable_1 = require("../../tools/observable");
var addEventListener_1 = require("../../browser/addEventListener");
var polyfills_1 = require("../../tools/utils/polyfills");
var stringUtils_1 = require("../../tools/utils/stringUtils");
exports.RawReportType = {
    intervention: 'intervention',
    deprecation: 'deprecation',
    cspViolation: 'csp_violation',
};
function initReportObservable(configuration, apis) {
    var observables = [];
    if ((0, polyfills_1.includes)(apis, exports.RawReportType.cspViolation)) {
        observables.push(createCspViolationReportObservable(configuration));
    }
    var reportTypes = apis.filter(function (api) { return api !== exports.RawReportType.cspViolation; });
    if (reportTypes.length) {
        observables.push(createReportObservable(reportTypes));
    }
    return observable_1.mergeObservables.apply(void 0, observables);
}
exports.initReportObservable = initReportObservable;
function createReportObservable(reportTypes) {
    var observable = new observable_1.Observable(function () {
        if (!window.ReportingObserver) {
            return;
        }
        var handleReports = (0, monitor_1.monitor)(function (reports, _) {
            return reports.forEach(function (report) {
                observable.notify(buildRawReportFromReport(report));
            });
        });
        var observer = new window.ReportingObserver(handleReports, {
            types: reportTypes,
            buffered: true,
        });
        observer.observe();
        return function () {
            observer.disconnect();
        };
    });
    return observable;
}
function createCspViolationReportObservable(configuration) {
    var observable = new observable_1.Observable(function () {
        var stop = (0, addEventListener_1.addEventListener)(configuration, document, "securitypolicyviolation" /* DOM_EVENT.SECURITY_POLICY_VIOLATION */, function (event) {
            observable.notify(buildRawReportFromCspViolation(event));
        }).stop;
        return stop;
    });
    return observable;
}
function buildRawReportFromReport(_a) {
    var type = _a.type, body = _a.body;
    return {
        type: type,
        subtype: body.id,
        message: "".concat(type, ": ").concat(body.message),
        stack: buildStack(body.id, body.message, body.sourceFile, body.lineNumber, body.columnNumber),
    };
}
function buildRawReportFromCspViolation(event) {
    var type = exports.RawReportType.cspViolation;
    var message = "'".concat(event.blockedURI, "' blocked by '").concat(event.effectiveDirective, "' directive");
    return {
        type: exports.RawReportType.cspViolation,
        subtype: event.effectiveDirective,
        message: "".concat(type, ": ").concat(message),
        stack: buildStack(event.effectiveDirective, event.originalPolicy
            ? "".concat(message, " of the policy \"").concat((0, stringUtils_1.safeTruncate)(event.originalPolicy, 100, '...'), "\"")
            : 'no policy', event.sourceFile, event.lineNumber, event.columnNumber),
    };
}
function buildStack(name, message, sourceFile, lineNumber, columnNumber) {
    return sourceFile
        ? (0, error_1.toStackTraceString)({
            name: name,
            message: message,
            stack: [
                {
                    func: '?',
                    url: sourceFile,
                    line: lineNumber !== null && lineNumber !== void 0 ? lineNumber : undefined,
                    column: columnNumber !== null && columnNumber !== void 0 ? columnNumber : undefined,
                },
            ],
        })
        : undefined;
}
//# sourceMappingURL=reportObservable.js.map