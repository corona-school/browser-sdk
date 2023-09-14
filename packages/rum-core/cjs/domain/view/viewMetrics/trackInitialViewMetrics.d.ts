import type { Duration } from '@datadog/browser-core';
import type { RumConfiguration } from '../../configuration';
import type { LifeCycle } from '../../lifeCycle';
import type { WebVitalTelemetryDebug } from '../startWebVitalTelemetryDebug';
export interface InitialViewMetrics {
    firstContentfulPaint?: Duration;
    firstByte?: Duration;
    domInteractive?: Duration;
    domContentLoaded?: Duration;
    domComplete?: Duration;
    loadEvent?: Duration;
    largestContentfulPaint?: Duration;
    firstInputDelay?: Duration;
    firstInputTime?: Duration;
}
export declare function trackInitialViewMetrics(lifeCycle: LifeCycle, configuration: RumConfiguration, webVitalTelemetryDebug: WebVitalTelemetryDebug, setLoadEvent: (loadEnd: Duration) => void, scheduleViewUpdate: () => void): {
    stop: () => void;
    initialViewMetrics: InitialViewMetrics;
};
