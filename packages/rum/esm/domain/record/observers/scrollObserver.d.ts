import type { DefaultPrivacyLevel, ListenerHandler } from '@datadog/browser-core';
import type { ElementsScrollPositions } from '../elementsScrollPositions';
import type { ScrollPosition } from '../../../types';
export type ScrollCallback = (p: ScrollPosition) => void;
export declare function initScrollObserver(cb: ScrollCallback, defaultPrivacyLevel: DefaultPrivacyLevel, elementsScrollPositions: ElementsScrollPositions): ListenerHandler;
