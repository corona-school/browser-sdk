import { Observable, defineGlobal, getGlobalObject, noop } from '@datadog/browser-core';
import { makeRumPublicApi, startRum } from '@datadog/browser-rum-core';
import { getSessionReplayLink } from '../domain/getSessionReplayLink';
export { DefaultPrivacyLevel } from '@datadog/browser-core';
export var datadogRum = makeRumPublicApi(startRum, {
    start: noop,
    stop: noop,
    onRumStart: noop,
    isRecording: function () { return false; },
    getReplayStats: function () { return undefined; },
    getSessionReplayLink: getSessionReplayLink,
    getSerializedNodeId: function () { return undefined; },
    recorderStartObservable: new Observable(),
});
defineGlobal(getGlobalObject(), 'DD_RUM', datadogRum);
//# sourceMappingURL=main.js.map