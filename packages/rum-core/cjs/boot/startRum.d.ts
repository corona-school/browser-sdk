import type { Observable, RawError, ContextManager } from '@datadog/browser-core';
import { LifeCycle } from '../domain/lifeCycle';
import type { RumSessionManager } from '../domain/rumSessionManager';
import type { LocationChange } from '../browser/locationChangeObservable';
import type { RumConfiguration, RumInitConfiguration } from '../domain/configuration';
import type { ViewOptions } from '../domain/view/trackViews';
import type { CommonContext } from '../domain/contexts/commonContext';
import type { RecorderApi } from './rumPublicApi';
export declare function startRum(initConfiguration: RumInitConfiguration, configuration: RumConfiguration, recorderApi: RecorderApi, globalContextManager: ContextManager, userContextManager: ContextManager, initialViewOptions?: ViewOptions): {
    addAction: (action: import("../domain/action/actionCollection").CustomAction, savedCommonContext?: CommonContext | undefined) => void;
    addError: ({ error, handlingStack, startClocks, context: customerContext }: import("../domain/error/errorCollection").ProvidedError, savedCommonContext?: CommonContext | undefined) => void;
    addTiming: (name: string, time?: import("@datadog/browser-core").TimeStamp | import("@datadog/browser-core").RelativeTime) => void;
    addFeatureFlagEvaluation: (key: string, value: import("@datadog/browser-core").ContextValue) => void;
    startView: (options?: ViewOptions | undefined, startClocks?: import("@datadog/browser-core").ClocksState | undefined) => void;
    lifeCycle: import("@datadog/browser-core").AbstractLifeCycle<import("../domain/lifeCycle").LifeCycleEventMap>;
    viewContexts: import("../domain/contexts/viewContexts").ViewContexts;
    session: RumSessionManager;
    stopSession: () => void;
    getInternalContext: (startTime?: number | undefined) => import("../domain/contexts/internalContext").InternalContext | undefined;
    stop: () => void;
};
export declare function startRumEventCollection(lifeCycle: LifeCycle, configuration: RumConfiguration, location: Location, sessionManager: RumSessionManager, locationChangeObservable: Observable<LocationChange>, domMutationObservable: Observable<void>, buildCommonContext: () => CommonContext, reportError: (error: RawError) => void): {
    viewContexts: import("../domain/contexts/viewContexts").ViewContexts;
    pageStateHistory: import("../domain/contexts/pageStateHistory").PageStateHistory;
    urlContexts: {
        findUrl: (startTime?: import("@datadog/browser-core").RelativeTime | undefined) => import("../domain/contexts/urlContexts").UrlContext | undefined;
        stop: () => void;
    };
    addAction: (action: import("../domain/action/actionCollection").CustomAction, savedCommonContext?: CommonContext | undefined) => void;
    actionContexts: import("../domain/action/trackClickActions").ActionContexts;
    stop: () => void;
};
