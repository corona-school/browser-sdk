import type { ListenerHandler } from '@datadog/browser-core';
import type { ViewportResizeDimension, VisualViewportRecord } from '../../../types';
export type ViewportResizeCallback = (d: ViewportResizeDimension) => void;
export type VisualViewportResizeCallback = (data: VisualViewportRecord['data']) => void;
export declare function initViewportResizeObserver(cb: ViewportResizeCallback): ListenerHandler;
export declare function initVisualViewportResizeObserver(cb: VisualViewportResizeCallback): ListenerHandler;
