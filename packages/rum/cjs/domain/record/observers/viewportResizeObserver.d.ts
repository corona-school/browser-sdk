import type { ListenerHandler } from '@datadog/browser-core';
import type { RumConfiguration } from '@datadog/browser-rum-core';
import type { ViewportResizeDimension, VisualViewportRecord } from '../../../types';
export type ViewportResizeCallback = (d: ViewportResizeDimension) => void;
export type VisualViewportResizeCallback = (data: VisualViewportRecord['data']) => void;
export declare function initViewportResizeObserver(configuration: RumConfiguration, cb: ViewportResizeCallback): ListenerHandler;
export declare function initVisualViewportResizeObserver(configuration: RumConfiguration, cb: VisualViewportResizeCallback): ListenerHandler;
