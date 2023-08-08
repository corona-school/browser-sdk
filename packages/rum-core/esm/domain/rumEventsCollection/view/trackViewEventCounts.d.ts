import type { LifeCycle } from '../../lifeCycle';
export declare const KEEP_TRACKING_EVENT_COUNTS_AFTER_VIEW_DELAY: number;
export declare function trackViewEventCounts(lifeCycle: LifeCycle, viewId: string, onChange: () => void): {
    scheduleStop: () => void;
    eventCounts: import("../../trackEventCounts").EventCounts;
};
