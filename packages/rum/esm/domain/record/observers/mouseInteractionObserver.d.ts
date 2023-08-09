import type { DefaultPrivacyLevel, ListenerHandler } from '@datadog/browser-core';
import type { BrowserIncrementalSnapshotRecord } from '../../../types';
import type { RecordIds } from './recordIds';
export type MouseInteractionCallBack = (record: BrowserIncrementalSnapshotRecord) => void;
export declare function initMouseInteractionObserver(cb: MouseInteractionCallBack, defaultPrivacyLevel: DefaultPrivacyLevel, recordIds: RecordIds): ListenerHandler;
