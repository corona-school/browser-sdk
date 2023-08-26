import type { DefaultPrivacyLevel, ListenerHandler } from '@datadog/browser-core';
import type { RumConfiguration } from '@datadog/browser-rum-core';
import type { ElementsScrollPositions } from '../elementsScrollPositions';
import type { ScrollPosition } from '../../../types';
export type ScrollCallback = (p: ScrollPosition) => void;
export declare function initScrollObserver(configuration: RumConfiguration, cb: ScrollCallback, defaultPrivacyLevel: DefaultPrivacyLevel, elementsScrollPositions: ElementsScrollPositions): ListenerHandler;
