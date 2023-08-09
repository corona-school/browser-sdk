import type { TelemetryEvent, TelemetryConfigurationEvent } from './telemetryEvent.types';
export declare const TelemetryType: {
    readonly log: "log";
    readonly configuration: "configuration";
};
export declare const enum StatusType {
    debug = "debug",
    error = "error"
}
export type RawTelemetryEvent = TelemetryEvent['telemetry'];
export type RawTelemetryConfiguration = TelemetryConfigurationEvent['telemetry']['configuration'];
