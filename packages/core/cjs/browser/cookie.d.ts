export interface CookieOptions {
    secure?: boolean;
    crossSite?: boolean;
    domain?: string;
}
export declare function setCookie(name: string, value: string, _expireDelay: number, _options?: CookieOptions): void;
export declare function getCookie(name: string): string | undefined;
export declare function deleteCookie(name: string, _options?: CookieOptions): void;
export declare function areCookiesAuthorized(options: CookieOptions): boolean;
export declare function getCurrentSite(): string;
