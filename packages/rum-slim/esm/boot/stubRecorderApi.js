import { noop } from '@datadog/browser-core';
import { getSessionReplayLink } from '../domain/getSessionReplayLink';
export function makeRecorderApiStub() {
    var getSessionReplayLinkStrategy = noop;
    return {
        start: noop,
        stop: noop,
        onRumStart: function (_lifeCycle, configuration) {
            getSessionReplayLinkStrategy = function () { return getSessionReplayLink(configuration); };
        },
        isRecording: function () { return false; },
        getReplayStats: function () { return undefined; },
        getSessionReplayLink: function () { return getSessionReplayLinkStrategy(); },
    };
}
//# sourceMappingURL=stubRecorderApi.js.map