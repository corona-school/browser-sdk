import type { Observable } from '../../tools/observable';
import type { RawError } from './error.types';
export declare function trackRuntimeError(errorObservable: Observable<RawError>): {
    stop: () => void;
};
