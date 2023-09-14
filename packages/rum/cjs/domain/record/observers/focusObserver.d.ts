import type { ListenerHandler } from '@datadog/browser-core';
import type { RumConfiguration } from '@datadog/browser-rum-core';
import type { FocusRecord } from '../../../types';
export type FocusCallback = (data: FocusRecord['data']) => void;
export declare function initFocusObserver(configuration: RumConfiguration, focusCb: FocusCallback): ListenerHandler;
