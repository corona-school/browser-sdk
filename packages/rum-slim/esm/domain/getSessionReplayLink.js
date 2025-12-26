import { getSessionReplayUrl } from '@datadog/browser-rum-core';
export function getSessionReplayLink(configuration) {
    return getSessionReplayUrl(configuration, { errorType: 'slim-package' });
}
//# sourceMappingURL=getSessionReplayLink.js.map