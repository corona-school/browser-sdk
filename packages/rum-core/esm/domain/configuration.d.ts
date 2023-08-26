import type { Configuration, InitConfiguration, MatchOption, RawTelemetryConfiguration } from '@datadog/browser-core';
import { DefaultPrivacyLevel } from '@datadog/browser-core';
import type { RumEventDomainContext } from '../domainContext.types';
import type { RumEvent } from '../rumEvent.types';
import type { TracingOption } from './tracing/tracer.types';
export interface RumInitConfiguration extends InitConfiguration {
    applicationId: string;
    beforeSend?: ((event: RumEvent, context: RumEventDomainContext) => void | boolean) | undefined;
    /**
     * @deprecated use sessionReplaySampleRate instead
     */
    premiumSampleRate?: number | undefined;
    excludedActivityUrls?: MatchOption[] | undefined;
    workerUrl?: string;
    /**
     * @deprecated use allowedTracingUrls instead
     */
    allowedTracingOrigins?: MatchOption[] | undefined;
    allowedTracingUrls?: Array<MatchOption | TracingOption> | undefined;
    /**
     * @deprecated use traceSampleRate instead
     */
    tracingSampleRate?: number | undefined;
    traceSampleRate?: number | undefined;
    defaultPrivacyLevel?: DefaultPrivacyLevel | undefined;
    subdomain?: string;
    /**
     * @deprecated use sessionReplaySampleRate instead
     */
    replaySampleRate?: number | undefined;
    sessionReplaySampleRate?: number | undefined;
    /**
     * @deprecated use trackUserInteractions instead
     */
    trackInteractions?: boolean | undefined;
    trackUserInteractions?: boolean | undefined;
    trackFrustrations?: boolean | undefined;
    actionNameAttribute?: string | undefined;
    trackViewsManually?: boolean | undefined;
    trackResources?: boolean | undefined;
    trackLongTasks?: boolean | undefined;
}
export type HybridInitConfiguration = Omit<RumInitConfiguration, 'applicationId' | 'clientToken'>;
export interface RumConfiguration extends Configuration {
    actionNameAttribute: string | undefined;
    traceSampleRate: number | undefined;
    allowedTracingUrls: TracingOption[];
    excludedActivityUrls: MatchOption[];
    workerUrl: string | undefined;
    applicationId: string;
    defaultPrivacyLevel: DefaultPrivacyLevel;
    oldPlansBehavior: boolean;
    sessionReplaySampleRate: number;
    trackUserInteractions: boolean;
    trackFrustrations: boolean;
    trackViewsManually: boolean;
    trackResources: boolean | undefined;
    trackLongTasks: boolean | undefined;
    version?: string;
    subdomain?: string;
    customerDataTelemetrySampleRate: number;
}
export declare function validateAndBuildRumConfiguration(initConfiguration: RumInitConfiguration): RumConfiguration | undefined;
export declare function serializeRumConfiguration(configuration: RumInitConfiguration): RawTelemetryConfiguration;
