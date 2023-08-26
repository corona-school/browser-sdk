export interface SessionState {
    id?: string;
    created?: string;
    expire?: string;
    lock?: string;
    [key: string]: string | undefined;
}
export declare function isSessionInExpiredState(session: SessionState): boolean;
export declare function expandSessionState(session: SessionState): void;
export declare function toSessionString(session: SessionState): string;
export declare function toSessionState(sessionString: string | undefined | null): SessionState;
