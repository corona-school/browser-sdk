import type { RelativeTime, Duration } from '@datadog/browser-core';
import type { InForegroundPeriod, PageStateServerEntry } from '../../rawRumEvent.types';
export interface ForegroundPeriod {
    start: RelativeTime;
    end?: RelativeTime;
}
export declare function mapToForegroundPeriods(pageStateServerEntries: PageStateServerEntry[], duration: Duration): InForegroundPeriod[];
