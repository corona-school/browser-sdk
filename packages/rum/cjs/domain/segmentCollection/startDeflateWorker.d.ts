import type { DeflateWorkerAction } from '@datadog/browser-worker';
import type { RumConfiguration } from '@datadog/browser-rum-core';
export declare const INITIALIZATION_TIME_OUT_DELAY: number;
export interface DeflateWorker extends Worker {
    postMessage(message: DeflateWorkerAction): void;
}
export declare function createDeflateWorker(configuration: RumConfiguration): DeflateWorker;
export declare function startDeflateWorker(configuration: RumConfiguration, callback: (worker?: DeflateWorker) => void, createDeflateWorkerImpl?: typeof createDeflateWorker): void;
export declare function resetDeflateWorkerState(): void;
/**
 * Starts the deflate worker and handle messages and errors
 *
 * The spec allow browsers to handle worker errors differently:
 * - Chromium throws an exception
 * - Firefox fires an error event
 *
 * more details: https://bugzilla.mozilla.org/show_bug.cgi?id=1736865#c2
 */
export declare function doStartDeflateWorker(configuration: RumConfiguration, createDeflateWorkerImpl?: typeof createDeflateWorker): DeflateWorker | undefined;
