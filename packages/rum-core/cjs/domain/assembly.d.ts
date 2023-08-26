import type { RawError } from '@datadog/browser-core';
import type { LifeCycle } from './lifeCycle';
import type { ViewContexts } from './contexts/viewContexts';
import type { RumSessionManager } from './rumSessionManager';
import type { UrlContexts } from './contexts/urlContexts';
import type { RumConfiguration } from './configuration';
import type { ActionContexts } from './rumEventsCollection/action/actionCollection';
import type { CommonContext } from './contexts/commonContext';
export declare function startRumAssembly(configuration: RumConfiguration, lifeCycle: LifeCycle, sessionManager: RumSessionManager, viewContexts: ViewContexts, urlContexts: UrlContexts, actionContexts: ActionContexts, buildCommonContext: () => CommonContext, reportError: (error: RawError) => void): void;
