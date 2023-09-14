import { computeBytesCount } from '../../tools/utils/byteUtils';
import type { Context } from '../../tools/serialisation/context';
import { Observable } from '../../tools/observable';
import type { CustomerDataType } from './contextConstants';
export declare const BYTES_COMPUTATION_THROTTLING_DELAY = 200;
export type ContextManager = ReturnType<typeof createContextManager>;
export declare function createContextManager(customerDataType: CustomerDataType, computeBytesCountImpl?: typeof computeBytesCount): {
    getBytesCount: () => number;
    /** @deprecated use getContext instead */
    get: () => Context;
    /** @deprecated use setContextProperty instead */
    add: (key: string, value: any) => void;
    /** @deprecated renamed to removeContextProperty */
    remove: (key: string) => void;
    /** @deprecated use setContext instead */
    set: (newContext: object) => void;
    getContext: () => Context;
    setContext: (newContext: Context) => void;
    setContextProperty: (key: string, property: any) => void;
    removeContextProperty: (key: string) => void;
    clearContext: () => void;
    changeObservable: Observable<void>;
};
