export declare const CUSTOMER_DATA_BYTES_LIMIT: number;
export declare const enum CustomerDataType {
    FeatureFlag = "feature flag evaluation",
    User = "user",
    GlobalContext = "global context",
    LoggerContext = "logger context"
}
export declare function warnIfCustomerDataLimitReached(bytesCount: number, customerDataType: CustomerDataType): boolean;
