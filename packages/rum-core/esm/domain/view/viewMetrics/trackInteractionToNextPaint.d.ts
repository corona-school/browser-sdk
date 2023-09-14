import type { Duration } from '@datadog/browser-core';
import { type LifeCycle } from '../../lifeCycle';
import { ViewLoadingType } from '../../../rawRumEvent.types';
/**
 * Track the interaction to next paint (INP).
 * To avoid outliers, return the p98 worst interaction of the view.
 * Documentation: https://web.dev/inp/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/main/src/onINP.ts
 */
export declare function trackInteractionToNextPaint(viewLoadingType: ViewLoadingType, lifeCycle: LifeCycle): {
    getInteractionToNextPaint: () => Duration | undefined;
    stop: () => void;
};
export declare function trackViewInteractionCount(viewLoadingType: ViewLoadingType): {
    getViewInteractionCount: () => number;
};
export declare function isInteractionToNextPaintSupported(): boolean;
