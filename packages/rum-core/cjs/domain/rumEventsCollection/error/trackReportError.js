"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackReportError = void 0;
var browser_core_1 = require("@datadog/browser-core");
function trackReportError(configuration, errorObservable) {
    var subscription = (0, browser_core_1.initReportObservable)(configuration, [
        browser_core_1.RawReportType.cspViolation,
        browser_core_1.RawReportType.intervention,
    ]).subscribe(function (reportError) {
        return errorObservable.notify({
            startClocks: (0, browser_core_1.clocksNow)(),
            message: reportError.message,
            stack: reportError.stack,
            type: reportError.subtype,
            source: browser_core_1.ErrorSource.REPORT,
            handling: "unhandled" /* ErrorHandling.UNHANDLED */,
        });
    });
    return {
        stop: function () {
            subscription.unsubscribe();
        },
    };
}
exports.trackReportError = trackReportError;
//# sourceMappingURL=trackReportError.js.map