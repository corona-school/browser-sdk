import type { Duration, RelativeTime } from '@datadog/browser-core';
import type { RumConfiguration } from '../../configuration';
import type { LifeCycle } from '../../lifeCycle';
import type { WebVitalTelemetryDebug } from './startWebVitalTelemetryDebug';
export declare const TIMING_MAXIMUM_DELAY: number;
/**
 * The initial view can finish quickly, before some metrics can be produced (ex: before the page load
 * event, or the first input). Also, we don't want to trigger a view update indefinitely, to avoid
 * updates on views that ended a long time ago. Keep watching for metrics after the view ends for a
 * limited amount of time.
 */
export declare const KEEP_TRACKING_TIMINGS_AFTER_VIEW_DELAY: number;
export interface Timings {
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
export declare function trackInitialViewTimings(lifeCycle: LifeCycle, configuration: RumConfiguration, webVitalTelemetryDebug: WebVitalTelemetryDebug, setLoadEvent: (loadEnd: Duration) => void, scheduleViewUpdate: () => void): {
    stop: () => void;
    timings: Timings;
    scheduleStop: () => void;
};
interface NavigationTimings {
    domComplete: Duration;
    domContentLoaded: Duration;
    domInteractive: Duration;
    loadEvent: Duration;
    firstByte: Duration | undefined;
}
export declare function trackNavigationTimings(lifeCycle: LifeCycle, callback: (timings: NavigationTimings) => void): {
    stop: () => void;
};
export declare function trackFirstContentfulPaintTiming(lifeCycle: LifeCycle, configuration: RumConfiguration, callback: (fcpTiming: RelativeTime) => void): {
    stop: () => void;
};
/**
 * Track the largest contentful paint (LCP) occurring during the initial View.  This can yield
 * multiple values, only the most recent one should be used.
 * Documentation: https://web.dev/lcp/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/master/src/getLCP.ts
 */
export declare function trackLargestContentfulPaintTiming(lifeCycle: LifeCycle, configuration: RumConfiguration, eventTarget: Window, callback: (lcpTiming: RelativeTime, lcpElement?: Element) => void): {
    stop: () => void;
};
/**
 * Track the first input occurring during the initial View to return:
 * - First Input Delay
 * - First Input Time
 * Callback is called at most one time.
 * Documentation: https://web.dev/fid/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/master/src/getFID.ts
 */
export declare function trackFirstInputTimings(lifeCycle: LifeCycle, configuration: RumConfiguration, callback: ({ firstInputDelay, firstInputTime, firstInputTarget, }: {
    firstInputDelay: Duration;
    firstInputTime: RelativeTime;
    firstInputTarget: Node | undefined;
}) => void): {
    stop: () => void;
};
export {};
