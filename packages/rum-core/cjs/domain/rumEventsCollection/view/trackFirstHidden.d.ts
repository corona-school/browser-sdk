import type { RelativeTime } from '@datadog/browser-core';
export declare function trackFirstHidden(eventTarget?: Window): {
    timeStamp: RelativeTime;
};
export declare function resetFirstHidden(): void;
