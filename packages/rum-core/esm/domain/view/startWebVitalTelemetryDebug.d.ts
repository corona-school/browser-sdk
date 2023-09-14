import type { Telemetry, RelativeTime } from '@datadog/browser-core';
import type { RecorderApi } from '../../boot/rumPublicApi';
import type { RumSessionManager } from '../rumSessionManager';
import type { RumConfiguration } from '../configuration';
export type WebVitalTelemetryDebug = ReturnType<typeof startWebVitalTelemetryDebug>;
export declare function startWebVitalTelemetryDebug(configuration: RumConfiguration, telemetry: Telemetry, recorderApi: RecorderApi, session: RumSessionManager): {
    addWebVitalTelemetryDebug(webVitalName: string, webVitalNode: Node | undefined, webVitalTime: RelativeTime): void;
};
