import type { StackTrace } from '../tracekit';
import type { ClocksState } from '../../tools/utils/timeUtils';
import type { ErrorSource, ErrorHandling, RawError, RawErrorCause, ErrorWithCause, NonErrorPrefix } from './error.types';
export declare const NO_ERROR_STACK_PRESENT_MESSAGE = "No stack, consider using an instance of Error";
type RawErrorParams = {
    stackTrace?: StackTrace;
    originalError: unknown;
    handlingStack?: string;
    startClocks: ClocksState;
    nonErrorPrefix: NonErrorPrefix;
    source: ErrorSource;
    handling: ErrorHandling;
};
export declare function computeRawError({ stackTrace, originalError, handlingStack, startClocks, nonErrorPrefix, source, handling, }: RawErrorParams): RawError;
export declare function tryToGetFingerprint(originalError: unknown): string | undefined;
export declare function toStackTraceString(stack: StackTrace): string;
export declare function getFileFromStackTraceString(stack: string): string | undefined;
export declare function formatErrorMessage(stack: StackTrace): string;
/**
 Creates a stacktrace without SDK internal frames.
 
 Constraints:
 - Has to be called at the utmost position of the call stack.
 - No monitored function should encapsulate it, that is why we need to use callMonitored inside it.
 */
export declare function createHandlingStack(): string;
export declare function flattenErrorCauses(error: ErrorWithCause, parentSource: ErrorSource): RawErrorCause[] | undefined;
export {};
