import type { Duration, RelativeTime } from '@datadog/browser-core';
import type { RumConfiguration } from '../domain/configuration';
import type { LifeCycle } from '../domain/lifeCycle';
import type { PerformanceEntryRepresentation } from '../domainContext.types';
type RumPerformanceObserverConstructor = new (callback: PerformanceObserverCallback) => RumPerformanceObserver;
export interface BrowserWindow extends Window {
    PerformanceObserver: RumPerformanceObserverConstructor;
    performance: Performance & {
        interactionCount?: number;
    };
}
export interface RumPerformanceObserver extends PerformanceObserver {
    observe(options?: PerformanceObserverInit & {
        durationThreshold: number;
    }): void;
}
export interface RumPerformanceResourceTiming {
    entryType: 'resource';
    initiatorType: string;
    name: string;
    startTime: RelativeTime;
    duration: Duration;
    fetchStart: RelativeTime;
    domainLookupStart: RelativeTime;
    domainLookupEnd: RelativeTime;
    connectStart: RelativeTime;
    secureConnectionStart: RelativeTime;
    connectEnd: RelativeTime;
    requestStart: RelativeTime;
    responseStart: RelativeTime;
    responseEnd: RelativeTime;
    redirectStart: RelativeTime;
    redirectEnd: RelativeTime;
    decodedBodySize: number;
    traceId?: string;
}
export interface RumPerformanceLongTaskTiming {
    entryType: 'longtask';
    startTime: RelativeTime;
    duration: Duration;
    toJSON(): PerformanceEntryRepresentation;
}
export interface RumPerformancePaintTiming {
    entryType: 'paint';
    name: 'first-paint' | 'first-contentful-paint';
    startTime: RelativeTime;
}
export interface RumPerformanceNavigationTiming {
    entryType: 'navigation';
    domComplete: RelativeTime;
    domContentLoadedEventEnd: RelativeTime;
    domInteractive: RelativeTime;
    loadEventEnd: RelativeTime;
    responseStart: RelativeTime;
}
export interface RumLargestContentfulPaintTiming {
    entryType: 'largest-contentful-paint';
    startTime: RelativeTime;
    size: number;
    element?: Element;
}
export interface RumFirstInputTiming {
    entryType: 'first-input';
    startTime: RelativeTime;
    processingStart: RelativeTime;
    duration: Duration;
    target?: Node;
    interactionId?: number;
}
export interface RumPerformanceEventTiming {
    entryType: 'event';
    startTime: RelativeTime;
    duration: Duration;
    interactionId?: number;
}
export interface RumLayoutShiftTiming {
    entryType: 'layout-shift';
    startTime: RelativeTime;
    value: number;
    hadRecentInput: boolean;
    sources?: Array<{
        node?: Node;
    }>;
}
export type RumPerformanceEntry = RumPerformanceResourceTiming | RumPerformanceLongTaskTiming | RumPerformancePaintTiming | RumPerformanceNavigationTiming | RumLargestContentfulPaintTiming | RumFirstInputTiming | RumPerformanceEventTiming | RumLayoutShiftTiming;
export declare function supportPerformanceTimingEvent(entryType: string): boolean;
export declare function startPerformanceCollection(lifeCycle: LifeCycle, configuration: RumConfiguration): void;
export declare function retrieveInitialDocumentResourceTiming(configuration: RumConfiguration, callback: (timing: RumPerformanceResourceTiming) => void): void;
export type RelativePerformanceTiming = {
    -readonly [key in keyof Omit<PerformanceTiming, 'toJSON'>]: RelativeTime;
};
export {};
