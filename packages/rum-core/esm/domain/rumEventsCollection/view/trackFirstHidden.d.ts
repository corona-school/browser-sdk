import type { RelativeTime } from '@datadog/browser-core';
import type { RumConfiguration } from '../../configuration';
export declare function trackFirstHidden(configuration: RumConfiguration, eventTarget?: Window): {
    timeStamp: RelativeTime;
};
export declare function resetFirstHidden(): void;
