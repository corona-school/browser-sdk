import type { ListenerHandler } from '@datadog/browser-core';
import type { RumConfiguration } from '@datadog/browser-rum-core';
import type { BrowserIncrementalSnapshotRecord } from '../../../types';
import type { RecordIds } from './recordIds';
export type MouseInteractionCallBack = (record: BrowserIncrementalSnapshotRecord) => void;
export declare function initMouseInteractionObserver(configuration: RumConfiguration, cb: MouseInteractionCallBack, recordIds: RecordIds): ListenerHandler;
