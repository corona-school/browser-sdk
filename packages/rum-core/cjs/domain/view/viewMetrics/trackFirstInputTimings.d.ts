import type { Duration, RelativeTime } from '@datadog/browser-core';
import type { LifeCycle } from '../../lifeCycle';
import type { FirstHidden } from './trackFirstHidden';
/**
 * Track the first input occurring during the initial View to return:
 * - First Input Delay
 * - First Input Time
 * Callback is called at most one time.
 * Documentation: https://web.dev/fid/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/master/src/getFID.ts
 */
export declare function trackFirstInputTimings(lifeCycle: LifeCycle, firstHidden: FirstHidden, callback: ({ firstInputDelay, firstInputTime, firstInputTarget, }: {
    firstInputDelay: Duration;
    firstInputTime: RelativeTime;
    firstInputTarget: Node | undefined;
}) => void): {
    stop: () => void;
};
