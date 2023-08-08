import { Observable } from '../tools/observable';
export declare const PageExitReason: {
    readonly HIDDEN: "visibility_hidden";
    readonly UNLOADING: "before_unload";
    readonly PAGEHIDE: "page_hide";
    readonly FROZEN: "page_frozen";
};
export type PageExitReason = (typeof PageExitReason)[keyof typeof PageExitReason];
export interface PageExitEvent {
    reason: PageExitReason;
}
export declare function createPageExitObservable(): Observable<PageExitEvent>;
export declare function isPageExitReason(reason: string | undefined): reason is PageExitReason;
