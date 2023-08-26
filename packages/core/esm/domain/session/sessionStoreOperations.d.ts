import type { SessionStoreStrategy } from './storeStrategies/sessionStoreStrategy';
import type { SessionState } from './sessionState';
type Operations = {
    process: (sessionState: SessionState) => SessionState | undefined;
    after?: (sessionState: SessionState) => void;
};
export declare const LOCK_RETRY_DELAY = 10;
export declare const LOCK_MAX_TRIES = 100;
export declare function processSessionStoreOperations(operations: Operations, sessionStoreStrategy: SessionStoreStrategy, numberOfRetries?: number): void;
/**
 * Lock strategy allows mitigating issues due to concurrent access to cookie.
 * This issue concerns only chromium browsers and enabling this on firefox increases cookie write failures.
 */
export declare const isLockEnabled: () => boolean;
export {};
