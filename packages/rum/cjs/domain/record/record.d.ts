import type { TimeStamp } from '@datadog/browser-core';
import type { LifeCycle, RumConfiguration } from '@datadog/browser-rum-core';
import type { BrowserRecord } from '../../types';
import type { ShadowRootsController } from './shadowRootsController';
export interface RecordOptions {
    emit?: (record: BrowserRecord) => void;
    configuration: RumConfiguration;
    lifeCycle: LifeCycle;
}
export interface RecordAPI {
    stop: () => void;
    takeSubsequentFullSnapshot: (timestamp?: TimeStamp) => void;
    flushMutations: () => void;
    shadowRootsController: ShadowRootsController;
}
export declare function record(options: RecordOptions): RecordAPI;
