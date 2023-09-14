import type { RumConfiguration } from '@datadog/browser-rum-core';
import type { DeflateWorker } from './deflateWorker';
export interface DeflateEncoder {
    write(data: string, callback: () => void): void;
    reset(): void;
    stop(): void;
    encodedBytesCount: number;
    encodedBytes: Uint8Array;
    rawBytesCount: number;
}
export declare const enum DeflateEncoderStreamId {
    REPLAY = 1
}
export declare function createDeflateEncoder(configuration: RumConfiguration, worker: DeflateWorker, streamId: DeflateEncoderStreamId): DeflateEncoder;
