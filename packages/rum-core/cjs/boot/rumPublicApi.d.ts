import type { Context, InitConfiguration, RelativeTime, User, Observable } from '@datadog/browser-core';
import type { LifeCycle } from '../domain/lifeCycle';
import type { ViewContexts } from '../domain/contexts/viewContexts';
import type { RumSessionManager } from '../domain/rumSessionManager';
import type { ReplayStats } from '../rawRumEvent.types';
import type { RumConfiguration, RumInitConfiguration } from '../domain/configuration';
import type { ViewOptions } from '../domain/rumEventsCollection/view/trackViews';
import type { startRum } from './startRum';
export type RumPublicApi = ReturnType<typeof makeRumPublicApi>;
export type StartRum = typeof startRum;
export interface RecorderApi {
    start: () => void;
    stop: () => void;
    onRumStart: (lifeCycle: LifeCycle, configuration: RumConfiguration, sessionManager: RumSessionManager, viewContexts: ViewContexts) => void;
    isRecording: () => boolean;
    getReplayStats: (viewId: string) => ReplayStats | undefined;
    getSessionReplayLink: (configuration: RumConfiguration, sessionManager: RumSessionManager, viewContexts: ViewContexts) => string | undefined;
    getSerializedNodeId: (node: Node) => number | undefined;
    recorderStartObservable: Observable<RelativeTime>;
}
interface RumPublicApiOptions {
    ignoreInitIfSyntheticsWillInjectRum?: boolean;
}
export declare function makeRumPublicApi(startRumImpl: StartRum, recorderApi: RecorderApi, { ignoreInitIfSyntheticsWillInjectRum }?: RumPublicApiOptions): {
    init: (initConfiguration: RumInitConfiguration) => void;
    /** @deprecated: use setGlobalContextProperty instead */
    addRumGlobalContext: (key: string, value: any) => void;
    setGlobalContextProperty: (key: string, property: any) => void;
    /** @deprecated: use removeGlobalContextProperty instead */
    removeRumGlobalContext: (key: string) => void;
    removeGlobalContextProperty: (key: string) => void;
    /** @deprecated: use getGlobalContext instead */
    getRumGlobalContext: () => Context;
    getGlobalContext: () => Context;
    /** @deprecated: use setGlobalContext instead */
    setRumGlobalContext: (newContext: object) => void;
    setGlobalContext: (newContext: Context) => void;
    clearGlobalContext: () => void;
    getInternalContext: (startTime?: number) => import("../domain/contexts/internalContext").InternalContext | undefined;
    getInitConfiguration: () => InitConfiguration | undefined;
    addAction: (name: string, context?: object) => void;
    addError: (error: unknown, context?: object) => void;
    addTiming: (name: string, time?: number) => void;
    setUser: (newUser: User) => void;
    getUser: () => Context;
    setUserProperty: (key: any, property: any) => void;
    removeUserProperty: (key: string) => void;
    /** @deprecated: renamed to clearUser */
    removeUser: () => void;
    clearUser: () => void;
    startView: {
        (name?: string): void;
        (options: ViewOptions): void;
    };
    stopSession: () => void;
    startSessionReplayRecording: () => void;
    stopSessionReplayRecording: () => void;
    /**
     * This feature is currently in beta. For more information see the full [feature flag tracking guide](https://docs.datadoghq.com/real_user_monitoring/feature_flag_tracking/).
     */
    addFeatureFlagEvaluation: (key: string, value: any) => void;
    getSessionReplayLink: () => string | undefined;
} & {
    onReady(callback: () => void): void;
    version: string;
};
export {};
