import { CustomerDataType } from './contextConstants';
export declare const CUSTOMER_DATA_BYTES_LIMIT: number;
export declare function warnIfCustomerDataLimitReached(bytesCount: number, customerDataType: CustomerDataType): boolean;
