import type { RetryInfo, FlushReason } from '../../transport';
import type { InitConfiguration } from './configuration';
export declare const ENDPOINTS: {
    readonly logs: "logs";
    readonly rum: "rum";
    readonly sessionReplay: "session-replay";
};
export type EndpointType = keyof typeof ENDPOINTS;
export type EndpointBuilder = ReturnType<typeof createEndpointBuilder>;
export declare function createEndpointBuilder(initConfiguration: InitConfiguration, endpointType: EndpointType, configurationTags: string[]): {
    build(api: 'xhr' | 'fetch' | 'beacon', flushReason?: FlushReason, retry?: RetryInfo): string;
    urlPrefix: string;
    endpointType: "logs" | "rum" | "sessionReplay";
};
