import type { ListenerHandler } from '@datadog/browser-core';
import type { StyleSheetRule } from '../../../types';
export type StyleSheetCallback = (s: StyleSheetRule) => void;
export declare function initStyleSheetObserver(cb: StyleSheetCallback): ListenerHandler;
export declare function getPathToNestedCSSRule(rule: CSSRule): number[] | undefined;
