import type { Context, Observable, PageExitEvent, RawError } from '@datadog/browser-core';
import type { LogsConfiguration } from '../domain/configuration';
import type { LifeCycle } from '../domain/lifeCycle';
export declare function startLogsBatch(configuration: LogsConfiguration, lifeCycle: LifeCycle, reportError: (error: RawError) => void, pageExitObservable: Observable<PageExitEvent>, sessionExpireObservable: Observable<void>): {
    flushObservable: Observable<import("@datadog/browser-core").FlushEvent>;
    add(message: Context, replicated?: boolean | undefined): void;
    upsert: (message: Context, key: string) => void;
    stop: () => void;
};
