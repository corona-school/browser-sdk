import type { ListenerHandler } from '@datadog/browser-core';
import type { LifeCycle } from '@datadog/browser-rum-core';
import type { FrustrationRecord } from '../../../types';
import type { RecordIds } from './recordIds';
export type FrustrationCallback = (record: FrustrationRecord) => void;
export declare function initFrustrationObserver(lifeCycle: LifeCycle, frustrationCb: FrustrationCallback, recordIds: RecordIds): ListenerHandler;
