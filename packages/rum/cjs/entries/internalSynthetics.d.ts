export { DefaultPrivacyLevel } from '@datadog/browser-core';
export declare const datadogRum: {
    init: (initConfiguration: import("@datadog/browser-rum-core").RumInitConfiguration) => void;
    addRumGlobalContext: (key: any, value: any) => void;
    setGlobalContextProperty: (key: any, value: any) => void;
    removeRumGlobalContext: (key: any) => void;
    removeGlobalContextProperty: (key: any) => void;
    getRumGlobalContext: () => import("@datadog/browser-core").Context;
    getGlobalContext: () => import("@datadog/browser-core").Context;
    setRumGlobalContext: (context: any) => void;
    setGlobalContext: (context: any) => void;
    clearGlobalContext: () => void;
    getInternalContext: (startTime?: number | undefined) => import("@datadog/browser-rum-core/cjs/domain/contexts/internalContext").InternalContext | undefined;
    getInitConfiguration: () => import("@datadog/browser-core").InitConfiguration | undefined;
    addAction: (name: string, context?: object | undefined) => void;
    addError: (error: unknown, context?: object | undefined) => void;
    addTiming: (name: string, time?: number | undefined) => void;
    setUser: (newUser: import("@datadog/browser-core").User) => void;
    getUser: () => import("@datadog/browser-core").Context;
    setUserProperty: (key: any, property: any) => void;
    removeUserProperty: (key: any) => void;
    removeUser: () => void;
    clearUser: () => void;
    startView: {
        (name?: string | undefined): void;
        (options: import("@datadog/browser-rum-core/cjs/domain/view/trackViews").ViewOptions): void;
    };
    stopSession: () => void;
    startSessionReplayRecording: () => void;
    stopSessionReplayRecording: () => void;
    addFeatureFlagEvaluation: (key: string, value: any) => void;
    getSessionReplayLink: () => string | undefined;
} & {
    onReady(callback: () => void): void;
    version: string;
};
