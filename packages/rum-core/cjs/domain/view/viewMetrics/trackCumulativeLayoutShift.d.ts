import { type RelativeTime } from '@datadog/browser-core';
import type { LifeCycle } from '../../lifeCycle';
/**
 * Track the cumulative layout shifts (CLS).
 * Layout shifts are grouped into session windows.
 * The minimum gap between session windows is 1 second.
 * The maximum duration of a session window is 5 second.
 * The session window layout shift value is the sum of layout shifts inside it.
 * The CLS value is the max of session windows values.
 *
 * This yields a new value whenever the CLS value is updated (a higher session window value is computed).
 *
 * See isLayoutShiftSupported to check for browser support.
 *
 * Documentation:
 * https://web.dev/cls/
 * https://web.dev/evolving-cls/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/master/src/getCLS.ts
 */
export declare function trackCumulativeLayoutShift(lifeCycle: LifeCycle, callback: (layoutShift: number, largestShiftNode: Node | undefined, largestShiftTime: RelativeTime) => void): {
    stop: () => void;
};
/**
 * Check whether `layout-shift` is supported by the browser.
 */
export declare function isLayoutShiftSupported(): boolean;
