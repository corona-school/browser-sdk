import { computeBytesCount } from '../../tools/utils/byteUtils';
import type { Configuration } from '../configuration';
import type { ContextManager } from './contextManager';
import type { CustomerDataType } from './contextConstants';
export declare function createStoredContextManager(configuration: Configuration, productKey: string, customerDataType: CustomerDataType, computeBytesCountImpl?: typeof computeBytesCount): ContextManager;
export declare function buildStorageKey(productKey: string, customerDataType: CustomerDataType): string;
export declare function removeStorageListeners(): void;
