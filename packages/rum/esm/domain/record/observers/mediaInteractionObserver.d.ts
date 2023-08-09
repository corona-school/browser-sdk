import type { DefaultPrivacyLevel, ListenerHandler } from '@datadog/browser-core';
import type { MediaInteraction } from '../../../types';
export type MediaInteractionCallback = (p: MediaInteraction) => void;
export declare function initMediaInteractionObserver(mediaInteractionCb: MediaInteractionCallback, defaultPrivacyLevel: DefaultPrivacyLevel): ListenerHandler;
