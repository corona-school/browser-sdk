import type { DefaultPrivacyLevel, ListenerHandler } from '@datadog/browser-core';
import type { RumConfiguration } from '@datadog/browser-rum-core';
import type { MediaInteraction } from '../../../types';
export type MediaInteractionCallback = (p: MediaInteraction) => void;
export declare function initMediaInteractionObserver(configuration: RumConfiguration, mediaInteractionCb: MediaInteractionCallback, defaultPrivacyLevel: DefaultPrivacyLevel): ListenerHandler;
