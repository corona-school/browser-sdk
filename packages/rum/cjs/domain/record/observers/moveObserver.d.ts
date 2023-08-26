import type { ListenerHandler } from '@datadog/browser-core';
import type { RumConfiguration } from '@datadog/browser-rum-core';
import type { MousePosition } from '../../../types';
import { IncrementalSource } from '../../../types';
export type MousemoveCallBack = (p: MousePosition[], source: typeof IncrementalSource.MouseMove | typeof IncrementalSource.TouchMove) => void;
export declare function initMoveObserver(configuration: RumConfiguration, cb: MousemoveCallBack): ListenerHandler;
export declare function tryToComputeCoordinates(event: MouseEvent | TouchEvent): {
    x: number;
    y: number;
} | undefined;
