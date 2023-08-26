import { clocksNow } from '../../tools/utils/timeUtils';
import { startUnhandledErrorCollection } from '../tracekit';
import { computeRawError } from './error';
import { ErrorSource } from './error.types';
export function trackRuntimeError(errorObservable) {
    return startUnhandledErrorCollection(function (stackTrace, originalError) {
        errorObservable.notify(computeRawError({
            stackTrace: stackTrace,
            originalError: originalError,
            startClocks: clocksNow(),
            nonErrorPrefix: "Uncaught" /* NonErrorPrefix.UNCAUGHT */,
            source: ErrorSource.SOURCE,
            handling: "unhandled" /* ErrorHandling.UNHANDLED */,
        }));
    });
}
//# sourceMappingURL=trackRuntimeError.js.map