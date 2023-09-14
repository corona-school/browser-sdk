import type { BrowserRecord, BrowserSegmentMetadata, CreationReason, SegmentContext } from '../../types';
import type { DeflateEncoder } from '../deflate';
export type FlushReason = Exclude<CreationReason, 'init'> | 'stop';
export declare class Segment {
    private encoder;
    private metadata;
    constructor(encoder: DeflateEncoder, context: SegmentContext, creationReason: CreationReason);
    addRecord(record: BrowserRecord, callback: () => void): void;
    flush(callback: (metadata: BrowserSegmentMetadata) => void): void;
}
