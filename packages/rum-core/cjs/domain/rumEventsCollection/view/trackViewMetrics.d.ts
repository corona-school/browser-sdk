import type { ClocksState, Duration, Observable } from '@datadog/browser-core';
import { ViewLoadingType } from '../../../rawRumEvent.types';
import type { RumConfiguration } from '../../configuration';
import type { LifeCycle } from '../../lifeCycle';
import type { WebVitalTelemetryDebug } from './startWebVitalTelemetryDebug';
export interface ScrollMetrics {
    maxDepth: number;
    maxDepthScrollHeight: number;
    maxDepthScrollTop: number;
    maxDepthTime: Duration;
}
/** Arbitrary scroll throttle duration */
export declare const THROTTLE_SCROLL_DURATION = 1000;
export interface ViewMetrics {
    loadingTime?: Duration;
    cumulativeLayoutShift?: number;
}
export declare function trackViewMetrics(lifeCycle: LifeCycle, domMutationObservable: Observable<void>, configuration: RumConfiguration, scheduleViewUpdate: () => void, loadingType: ViewLoadingType, viewStart: ClocksState, webVitalTelemetryDebug: WebVitalTelemetryDebug): {
    stop: () => void;
    setLoadEvent: (loadEvent: Duration) => void;
    viewMetrics: ViewMetrics;
    getScrollMetrics: () => ScrollMetrics | undefined;
};
export declare function trackScrollMetrics(configuration: RumConfiguration, viewStart: ClocksState, callback: (scrollMetrics: ScrollMetrics) => void, getScrollValues?: typeof computeScrollValues): {
    stop: () => void;
};
declare function computeScrollValues(): {
    scrollHeight: number;
    scrollDepth: number;
    scrollTop: number;
};
export {};
