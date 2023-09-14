export declare function normalizeUrl(url: string): string;
export declare function isValidUrl(url: string): boolean;
export declare function getOrigin(url: string): string;
export declare function getPathName(url: string): string;
export declare function getSearch(url: string): string;
export declare function getHash(url: string): string;
export declare function buildUrl(url: string, base?: string): URL | HTMLAnchorElement;
export declare function getLocationOrigin(): string;
/**
 * Fallback
 * On IE HTMLAnchorElement origin is not supported: https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/origin
 * On Firefox window.location.origin is "null" for file: URIs: https://bugzilla.mozilla.org/show_bug.cgi?id=878297
 */
export declare function getLinkElementOrigin(element: Location | HTMLAnchorElement | URL): string;
