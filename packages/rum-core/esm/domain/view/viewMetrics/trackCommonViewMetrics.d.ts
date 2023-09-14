import type { ClocksState, Duration, Observable } from '@datadog/browser-core';
import type { ViewLoadingType } from '../../../rawRumEvent.types';
import type { RumConfiguration } from '../../configuration';
import type { LifeCycle } from '../../lifeCycle';
import type { WebVitalTelemetryDebug } from '../startWebVitalTelemetryDebug';
import type { ScrollMetrics } from './trackScrollMetrics';
export interface CommonViewMetrics {
    loadingTime?: Duration;
    cumulativeLayoutShift?: number;
    interactionToNextPaint?: Duration;
    scroll?: ScrollMetrics;
}
export declare function trackCommonViewMetrics(lifeCycle: LifeCycle, domMutationObservable: Observable<void>, configuration: RumConfiguration, scheduleViewUpdate: () => void, loadingType: ViewLoadingType, viewStart: ClocksState, webVitalTelemetryDebug: WebVitalTelemetryDebug): {
    stop: () => void;
    setLoadEvent: (loadEvent: Duration) => void;
    getCommonViewMetrics: () => CommonViewMetrics;
};
