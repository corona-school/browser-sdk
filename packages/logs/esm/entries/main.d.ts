export { Logger, LogsMessage, StatusType, HandlerType } from '../domain/logger';
export { LoggerConfiguration, LogsPublicApi as LogsGlobal } from '../boot/logsPublicApi';
export { LogsInitConfiguration } from '../domain/configuration';
export { LogsEvent } from '../logsEvent.types';
export declare const datadogLogs: {
    logger: import("../domain/logger").Logger;
    init: (initConfiguration: import("../domain/configuration").LogsInitConfiguration) => void;
    getLoggerGlobalContext: () => import("@datadog/browser-core").Context;
    getGlobalContext: () => import("@datadog/browser-core").Context;
    setLoggerGlobalContext: (context: any) => void;
    setGlobalContext: (context: any) => void;
    addLoggerGlobalContext: (key: any, value: any) => void;
    setGlobalContextProperty: (key: any, value: any) => void;
    removeLoggerGlobalContext: (key: any) => void;
    removeGlobalContextProperty: (key: any) => void;
    clearGlobalContext: () => void;
    createLogger: (name: string, conf?: import("../boot/logsPublicApi").LoggerConfiguration) => import("../domain/logger").Logger;
    getLogger: (name: string) => import("../domain/logger").Logger | undefined;
    getInitConfiguration: () => import("@datadog/browser-core").InitConfiguration | undefined;
    getInternalContext: (startTime?: number | undefined) => import("../domain/internalContext").InternalContext | undefined;
    setUser: (newUser: import("@datadog/browser-core").User) => void;
    getUser: () => import("@datadog/browser-core").Context;
    setUserProperty: (key: any, property: any) => void;
    removeUserProperty: (key: any) => void;
    clearUser: () => void;
} & {
    onReady(callback: () => void): void;
    version: string;
};
