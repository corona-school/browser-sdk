import type { Context, PageExitEvent, RawError, RelativeTime } from '@datadog/browser-core';
import { AbstractLifeCycle } from '@datadog/browser-core';
import type { RumPerformanceEntry } from '../browser/performanceCollection';
import type { RumEventDomainContext } from '../domainContext.types';
import type { RawRumEvent } from '../rawRumEvent.types';
import type { RumEvent } from '../rumEvent.types';
import type { CommonContext } from './contexts/commonContext';
import type { RequestCompleteEvent, RequestStartEvent } from './requestCollection';
import type { AutoAction } from './action/actionCollection';
import type { ViewEvent, ViewCreatedEvent, ViewEndedEvent } from './view/trackViews';
export declare const enum LifeCycleEventType {
    PERFORMANCE_ENTRIES_COLLECTED = 0,
    AUTO_ACTION_COMPLETED = 1,
    VIEW_CREATED = 2,
    VIEW_UPDATED = 3,
    VIEW_ENDED = 4,
    REQUEST_STARTED = 5,
    REQUEST_COMPLETED = 6,
    SESSION_EXPIRED = 7,
    SESSION_RENEWED = 8,
    PAGE_EXITED = 9,
    RAW_RUM_EVENT_COLLECTED = 10,
    RUM_EVENT_COLLECTED = 11,
    RAW_ERROR_COLLECTED = 12
}
declare const LifeCycleEventTypeAsConst: {
    PERFORMANCE_ENTRIES_COLLECTED: LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED;
    AUTO_ACTION_COMPLETED: LifeCycleEventType.AUTO_ACTION_COMPLETED;
    VIEW_CREATED: LifeCycleEventType.VIEW_CREATED;
    VIEW_UPDATED: LifeCycleEventType.VIEW_UPDATED;
    VIEW_ENDED: LifeCycleEventType.VIEW_ENDED;
    REQUEST_STARTED: LifeCycleEventType.REQUEST_STARTED;
    REQUEST_COMPLETED: LifeCycleEventType.REQUEST_COMPLETED;
    SESSION_EXPIRED: LifeCycleEventType.SESSION_EXPIRED;
    SESSION_RENEWED: LifeCycleEventType.SESSION_RENEWED;
    PAGE_EXITED: LifeCycleEventType.PAGE_EXITED;
    RAW_RUM_EVENT_COLLECTED: LifeCycleEventType.RAW_RUM_EVENT_COLLECTED;
    RUM_EVENT_COLLECTED: LifeCycleEventType.RUM_EVENT_COLLECTED;
    RAW_ERROR_COLLECTED: LifeCycleEventType.RAW_ERROR_COLLECTED;
};
export interface LifeCycleEventMap {
    [LifeCycleEventTypeAsConst.PERFORMANCE_ENTRIES_COLLECTED]: RumPerformanceEntry[];
    [LifeCycleEventTypeAsConst.AUTO_ACTION_COMPLETED]: AutoAction;
    [LifeCycleEventTypeAsConst.VIEW_CREATED]: ViewCreatedEvent;
    [LifeCycleEventTypeAsConst.VIEW_UPDATED]: ViewEvent;
    [LifeCycleEventTypeAsConst.VIEW_ENDED]: ViewEndedEvent;
    [LifeCycleEventTypeAsConst.REQUEST_STARTED]: RequestStartEvent;
    [LifeCycleEventTypeAsConst.REQUEST_COMPLETED]: RequestCompleteEvent;
    [LifeCycleEventTypeAsConst.SESSION_EXPIRED]: void;
    [LifeCycleEventTypeAsConst.SESSION_RENEWED]: void;
    [LifeCycleEventTypeAsConst.PAGE_EXITED]: PageExitEvent;
    [LifeCycleEventTypeAsConst.RAW_RUM_EVENT_COLLECTED]: RawRumEventCollectedData;
    [LifeCycleEventTypeAsConst.RUM_EVENT_COLLECTED]: RumEvent & Context;
    [LifeCycleEventTypeAsConst.RAW_ERROR_COLLECTED]: {
        error: RawError;
        savedCommonContext?: CommonContext;
        customerContext?: Context;
    };
}
export interface RawRumEventCollectedData<E extends RawRumEvent = RawRumEvent> {
    startTime: RelativeTime;
    savedCommonContext?: CommonContext;
    customerContext?: Context;
    rawRumEvent: E;
    domainContext: RumEventDomainContext<E['type']>;
}
export declare const LifeCycle: {
    new (): AbstractLifeCycle<LifeCycleEventMap>;
};
export type LifeCycle = AbstractLifeCycle<LifeCycleEventMap>;
export {};
