import type { DefaultPrivacyLevel, ListenerHandler } from '@datadog/browser-core';
import type { InputState } from '../../../types';
export type InputCallback = (v: InputState & {
    id: number;
}) => void;
export declare function initInputObserver(cb: InputCallback, defaultPrivacyLevel: DefaultPrivacyLevel, target?: Document | ShadowRoot): ListenerHandler;
