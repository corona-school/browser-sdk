import type { ContextManager, FlushEvent, Observable, Telemetry } from '@datadog/browser-core';
import type { RumConfiguration } from './configuration';
import type { FeatureFlagContexts } from './contexts/featureFlagContext';
import type { LifeCycle } from './lifeCycle';
export declare const MEASURES_PERIOD_DURATION: number;
export declare function startCustomerDataTelemetry(configuration: RumConfiguration, telemetry: Telemetry, lifeCycle: LifeCycle, globalContextManager: ContextManager, userContextManager: ContextManager, featureFlagContexts: FeatureFlagContexts, batchFlushObservable: Observable<FlushEvent>): void;
