import type { HttpRequest } from '@datadog/browser-core';
import type { LifeCycle, ViewContexts, RumConfiguration, RumSessionManager } from '@datadog/browser-rum-core';
import type { DeflateEncoder } from '../domain/deflate';
export declare function startRecording(lifeCycle: LifeCycle, configuration: RumConfiguration, sessionManager: RumSessionManager, viewContexts: ViewContexts, encoder: DeflateEncoder, httpRequest?: HttpRequest): {
    stop: () => void;
};
