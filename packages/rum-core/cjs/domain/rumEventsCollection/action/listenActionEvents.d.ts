export type MouseEventOnElement = PointerEvent & {
    target: Element;
};
export interface UserActivity {
    selection: boolean;
    input: boolean;
}
export interface ActionEventsHooks<ClickContext> {
    onPointerDown: (event: MouseEventOnElement) => ClickContext | undefined;
    onPointerUp: (context: ClickContext, event: MouseEventOnElement, getUserActivity: () => UserActivity) => void;
}
export declare function listenActionEvents<ClickContext>({ onPointerDown, onPointerUp }: ActionEventsHooks<ClickContext>): {
    stop: () => void;
};
