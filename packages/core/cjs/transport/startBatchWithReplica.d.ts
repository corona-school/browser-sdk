import type { Configuration, EndpointBuilder } from '../domain/configuration';
import type { Context } from '../tools/serialisation/context';
import type { Observable } from '../tools/observable';
import type { PageExitEvent } from '../browser/pageExitObservable';
import type { RawError } from '../domain/error/error.types';
export declare function startBatchWithReplica<T extends Context>(configuration: Configuration, endpoint: EndpointBuilder, reportError: (error: RawError) => void, pageExitObservable: Observable<PageExitEvent>, sessionExpireObservable: Observable<void>, replicaEndpoint?: EndpointBuilder): {
    add(message: T, replicated?: boolean): void;
};
