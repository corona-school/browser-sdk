import type { RelativeTime } from '@datadog/browser-core';
import { type LifeCycle } from '../../lifeCycle';
import type { RumConfiguration } from '../../configuration';
import type { FirstHidden } from './trackFirstHidden';
export declare const LCP_MAXIMUM_DELAY: number;
/**
 * Track the largest contentful paint (LCP) occurring during the initial View.  This can yield
 * multiple values, only the most recent one should be used.
 * Documentation: https://web.dev/lcp/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/master/src/getLCP.ts
 */
export declare function trackLargestContentfulPaint(lifeCycle: LifeCycle, configuration: RumConfiguration, firstHidden: FirstHidden, eventTarget: Window, callback: (lcpTiming: RelativeTime, lcpElement?: Element) => void): {
    stop: () => void;
};
