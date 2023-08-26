import type { Context, InitConfiguration, User } from '@datadog/browser-core';
import type { LogsInitConfiguration } from '../domain/configuration';
import type { HandlerType, StatusType } from '../domain/logger';
import { Logger } from '../domain/logger';
import type { startLogs } from './startLogs';
export interface LoggerConfiguration {
    level?: StatusType;
    handler?: HandlerType | HandlerType[];
    context?: object;
}
export type LogsPublicApi = ReturnType<typeof makeLogsPublicApi>;
export type StartLogs = typeof startLogs;
export declare function makeLogsPublicApi(startLogsImpl: StartLogs): {
    logger: Logger;
    init: (initConfiguration: LogsInitConfiguration) => void;
    /** @deprecated: use getGlobalContext instead */
    getLoggerGlobalContext: () => Context;
    getGlobalContext: () => Context;
    /** @deprecated: use setGlobalContext instead */
    setLoggerGlobalContext: (newContext: object) => void;
    setGlobalContext: (newContext: Context) => void;
    /** @deprecated: use setGlobalContextProperty instead */
    addLoggerGlobalContext: (key: string, value: any) => void;
    setGlobalContextProperty: (key: string, property: any) => void;
    /** @deprecated: use removeGlobalContextProperty instead */
    removeLoggerGlobalContext: (key: string) => void;
    removeGlobalContextProperty: (key: string) => void;
    clearGlobalContext: () => void;
    createLogger: (name: string, conf?: LoggerConfiguration) => Logger;
    getLogger: (name: string) => Logger | undefined;
    getInitConfiguration: () => InitConfiguration | undefined;
    getInternalContext: (startTime?: number | undefined) => import("../domain/internalContext").InternalContext | undefined;
    setUser: (newUser: User) => void;
    getUser: () => Context;
    setUserProperty: (key: any, property: any) => void;
    removeUserProperty: (key: string) => void;
    clearUser: () => void;
} & {
    onReady(callback: () => void): void;
    version: string;
};
