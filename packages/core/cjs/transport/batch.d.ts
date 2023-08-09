import type { Context } from '../tools/serialisation/context';
import type { HttpRequest } from './httpRequest';
import type { FlushController } from './flushController';
export declare class Batch {
    private request;
    private flushController;
    private messageBytesLimit;
    private pushOnlyBuffer;
    private upsertBuffer;
    constructor(request: HttpRequest, flushController: FlushController, messageBytesLimit: number);
    add(message: Context): void;
    upsert(message: Context, key: string): void;
    private flush;
    private addOrUpdate;
    private process;
    private push;
    private remove;
    private hasMessageFor;
}
