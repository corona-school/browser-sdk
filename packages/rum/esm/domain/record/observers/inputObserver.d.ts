import type { ListenerHandler } from '@datadog/browser-core';
import type { RumConfiguration } from '@datadog/browser-rum-core';
import type { InputState } from '../../../types';
export type InputCallback = (v: InputState & {
    id: number;
}) => void;
export declare function initInputObserver(configuration: RumConfiguration, cb: InputCallback, target?: Document | ShadowRoot): ListenerHandler;
