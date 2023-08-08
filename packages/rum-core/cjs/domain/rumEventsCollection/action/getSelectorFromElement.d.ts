/**
 * Stable attributes are attributes that are commonly used to identify parts of a UI (ex:
 * component). Those attribute values should not be generated randomly (hardcoded most of the time)
 * and stay the same across deploys. They are not necessarily unique across the document.
 */
export declare const STABLE_ATTRIBUTES: string[];
export declare function getSelectorFromElement(targetElement: Element, actionNameAttribute: string | undefined): string;
export declare function supportScopeSelector(): boolean;
