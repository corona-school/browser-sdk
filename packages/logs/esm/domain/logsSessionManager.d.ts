import type { RelativeTime } from '@datadog/browser-core';
import { Observable } from '@datadog/browser-core';
import type { LogsConfiguration } from './configuration';
export declare const LOGS_SESSION_KEY = "logs";
export interface LogsSessionManager {
    findTrackedSession: (startTime?: RelativeTime) => LogsSession | undefined;
    expireObservable: Observable<void>;
}
export type LogsSession = {
    id?: string;
};
export declare const enum LoggerTrackingType {
    NOT_TRACKED = "0",
    TRACKED = "1"
}
export declare function startLogsSessionManager(configuration: LogsConfiguration): LogsSessionManager;
export declare function startLogsSessionManagerStub(configuration: LogsConfiguration): LogsSessionManager;
