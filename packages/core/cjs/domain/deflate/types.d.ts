export type DeflateWorkerAction = {
    action: 'init';
} | {
    action: 'write';
    id: number;
    streamId: number;
    data: string;
} | {
    action: 'reset';
    streamId: number;
};
export type DeflateWorkerResponse = {
    type: 'initialized';
    version: string;
} | {
    type: 'wrote';
    id: number;
    streamId: number;
    result: Uint8Array;
    trailer: Uint8Array;
    additionalBytesCount: number;
} | {
    type: 'errored';
    streamId?: number;
    error: Error | string;
};
