import { noop } from '@datadog/browser-core';
import type { LifeCycle, RumConfiguration } from '@datadog/browser-rum-core';
export declare function makeRecorderApiStub(): {
    start: typeof noop;
    stop: typeof noop;
    onRumStart(_lifeCycle: LifeCycle, configuration: RumConfiguration): void;
    isRecording: () => boolean;
    getReplayStats: () => undefined;
    getSessionReplayLink: () => string | undefined;
};
