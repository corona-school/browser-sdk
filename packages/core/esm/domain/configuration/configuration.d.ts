import type { RawTelemetryConfiguration } from '../telemetry';
import type { Duration } from '../../tools/utils/timeUtils';
import type { SessionStoreStrategyType } from '../session/storeStrategies/sessionStoreStrategy';
import type { TransportConfiguration } from './transportConfiguration';
export declare const DefaultPrivacyLevel: {
    readonly ALLOW: "allow";
    readonly MASK: "mask";
    readonly MASK_USER_INPUT: "mask-user-input";
};
export type DefaultPrivacyLevel = (typeof DefaultPrivacyLevel)[keyof typeof DefaultPrivacyLevel];
export interface InitConfiguration {
    clientToken: string;
    beforeSend?: GenericBeforeSendCallback | undefined;
    /**
     * @deprecated use sessionSampleRate instead
     */
    sampleRate?: number | undefined;
    sessionSampleRate?: number | undefined;
    telemetrySampleRate?: number | undefined;
    silentMultipleInit?: boolean | undefined;
    trackResources?: boolean | undefined;
    trackLongTasks?: boolean | undefined;
    storeContextsAcrossPages?: boolean | undefined;
    proxy?: string | undefined;
    /**
     * @deprecated use `proxy` instead
     */
    proxyUrl?: string | undefined;
    site?: string | undefined;
    service?: string | undefined;
    env?: string | undefined;
    version?: string | undefined;
    useCrossSiteSessionCookie?: boolean | undefined;
    useSecureSessionCookie?: boolean | undefined;
    trackSessionAcrossSubdomains?: boolean | undefined;
    allowFallbackToLocalStorage?: boolean | undefined;
    enableExperimentalFeatures?: string[] | undefined;
    replica?: ReplicaUserConfiguration | undefined;
    datacenter?: string;
    internalAnalyticsSubdomain?: string;
    telemetryConfigurationSampleRate?: number;
}
type GenericBeforeSendCallback = (event: any, context?: any) => unknown;
interface ReplicaUserConfiguration {
    applicationId?: string;
    clientToken: string;
}
export interface Configuration extends TransportConfiguration {
    beforeSend: GenericBeforeSendCallback | undefined;
    sessionStoreStrategyType: SessionStoreStrategyType | undefined;
    sessionSampleRate: number;
    telemetrySampleRate: number;
    telemetryConfigurationSampleRate: number;
    service: string | undefined;
    silentMultipleInit: boolean;
    eventRateLimiterThreshold: number;
    maxTelemetryEventsPerPage: number;
    batchBytesLimit: number;
    flushTimeout: Duration;
    batchMessagesLimit: number;
    messageBytesLimit: number;
}
export declare function validateAndBuildConfiguration(initConfiguration: InitConfiguration): Configuration | undefined;
export declare function serializeConfiguration(initConfiguration: InitConfiguration): Partial<RawTelemetryConfiguration>;
export {};
