import type { ClocksState, Duration } from '@datadog/browser-core';
import type { RumConfiguration } from '../../configuration';
/** Arbitrary scroll throttle duration */
export declare const THROTTLE_SCROLL_DURATION = 1000;
export interface ScrollMetrics {
    maxDepth: number;
    maxDepthScrollHeight: number;
    maxDepthScrollTop: number;
    maxDepthTime: Duration;
}
export declare function trackScrollMetrics(configuration: RumConfiguration, viewStart: ClocksState, callback: (scrollMetrics: ScrollMetrics) => void, getScrollValues?: typeof computeScrollValues): {
    stop: () => void;
};
export declare function computeScrollValues(): {
    scrollHeight: number;
    scrollDepth: number;
    scrollTop: number;
};
