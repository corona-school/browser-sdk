import type { Observable } from '../../tools/observable';
import type { Context } from '../../tools/serialisation/context';
import type { RelativeTime } from '../../tools/utils/timeUtils';
import type { Configuration } from '../configuration';
export interface SessionManager<TrackingType extends string> {
    findActiveSession: (startTime?: RelativeTime) => SessionContext<TrackingType> | undefined;
    renewObservable: Observable<void>;
    expireObservable: Observable<void>;
    expire: () => void;
}
export interface SessionContext<TrackingType extends string> extends Context {
    id: string;
    trackingType: TrackingType;
}
export declare const VISIBILITY_CHECK_DELAY: number;
export declare function startSessionManager<TrackingType extends string>(configuration: Configuration, productKey: string, computeSessionState: (rawTrackingType?: string) => {
    trackingType: TrackingType;
    isTracked: boolean;
}): SessionManager<TrackingType>;
export declare function stopSessionManager(): void;
