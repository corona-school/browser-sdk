import type { RumConfiguration } from '@datadog/browser-rum-core';
import type { InputCallback, MutationCallBack } from './observers';
export type ShadowRootCallBack = (shadowRoot: ShadowRoot) => void;
export interface ShadowRootsController {
    addShadowRoot: ShadowRootCallBack;
    removeShadowRoot: ShadowRootCallBack;
    stop: () => void;
    flush: () => void;
}
export declare const initShadowRootsController: (configuration: RumConfiguration, { mutationCb, inputCb, }: {
    mutationCb: MutationCallBack;
    inputCb: InputCallback;
}) => ShadowRootsController;
