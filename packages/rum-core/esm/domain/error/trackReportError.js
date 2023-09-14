import { clocksNow, ErrorSource, initReportObservable, RawReportType } from '@datadog/browser-core';
export function trackReportError(configuration, errorObservable) {
    var subscription = initReportObservable(configuration, [
        RawReportType.cspViolation,
        RawReportType.intervention,
    ]).subscribe(function (reportError) {
        return errorObservable.notify({
            startClocks: clocksNow(),
            message: reportError.message,
            stack: reportError.stack,
            type: reportError.subtype,
            source: ErrorSource.REPORT,
            handling: "unhandled" /* ErrorHandling.UNHANDLED */,
        });
    });
    return {
        stop: function () {
            subscription.unsubscribe();
        },
    };
}
//# sourceMappingURL=trackReportError.js.map