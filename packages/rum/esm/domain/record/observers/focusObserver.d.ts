import type { ListenerHandler } from '@datadog/browser-core';
import type { FocusRecord } from '../../../types';
export type FocusCallback = (data: FocusRecord['data']) => void;
export declare function initFocusObserver(focusCb: FocusCallback): ListenerHandler;
