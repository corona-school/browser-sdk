import type { RumConfiguration } from '../configuration';
import type { LifeCycle } from '../lifeCycle';
import type { RumSessionManager } from '../rumSessionManager';
import type { PageStateHistory } from '../contexts/pageStateHistory';
export declare function startResourceCollection(lifeCycle: LifeCycle, configuration: RumConfiguration, sessionManager: RumSessionManager, pageStateHistory: PageStateHistory): void;
