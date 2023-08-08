import type { BrowserRecord, BrowserSegmentMetadata, CreationReason, SegmentContext } from '../../types';
import type { DeflateWorker } from './startDeflateWorker';
export type FlushReason = Exclude<CreationReason, 'init'> | 'stop';
export declare class Segment {
    private worker;
    flushReason: FlushReason | undefined;
    readonly metadata: BrowserSegmentMetadata;
    private id;
    private pendingWriteCount;
    constructor(worker: DeflateWorker, context: SegmentContext, creationReason: CreationReason, initialRecord: BrowserRecord, onWrote: (compressedBytesCount: number) => void, onFlushed: (data: Uint8Array, rawBytesCount: number) => void);
    addRecord(record: BrowserRecord): void;
    flush(reason: FlushReason): void;
    private write;
}
