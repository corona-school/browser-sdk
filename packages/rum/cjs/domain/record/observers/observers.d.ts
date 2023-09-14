import type { ListenerHandler } from '@datadog/browser-core';
import type { LifeCycle, RumConfiguration } from '@datadog/browser-rum-core';
import type { ElementsScrollPositions } from '../elementsScrollPositions';
import type { ShadowRootsController } from '../shadowRootsController';
import type { MousemoveCallBack } from './moveObserver';
import type { ScrollCallback } from './scrollObserver';
import type { MouseInteractionCallBack } from './mouseInteractionObserver';
import type { InputCallback } from './inputObserver';
import type { StyleSheetCallback } from './styleSheetObserver';
import type { MediaInteractionCallback } from './mediaInteractionObserver';
import type { FrustrationCallback } from './frustrationObserver';
import type { ViewportResizeCallback, VisualViewportResizeCallback } from './viewportResizeObserver';
import type { MutationCallBack } from './mutationObserver';
import type { FocusCallback } from './focusObserver';
interface ObserverParam {
    lifeCycle: LifeCycle;
    configuration: RumConfiguration;
    elementsScrollPositions: ElementsScrollPositions;
    mutationCb: MutationCallBack;
    mousemoveCb: MousemoveCallBack;
    mouseInteractionCb: MouseInteractionCallBack;
    scrollCb: ScrollCallback;
    viewportResizeCb: ViewportResizeCallback;
    visualViewportResizeCb: VisualViewportResizeCallback;
    inputCb: InputCallback;
    mediaInteractionCb: MediaInteractionCallback;
    styleSheetCb: StyleSheetCallback;
    focusCb: FocusCallback;
    frustrationCb: FrustrationCallback;
    shadowRootsController: ShadowRootsController;
}
export declare function initObservers(configuration: RumConfiguration, o: ObserverParam): {
    stop: ListenerHandler;
    flush: ListenerHandler;
};
export {};
