// Keep the following in sync with packages/rum/src/entries/main.ts
import { defineGlobal, getGlobalObject } from '@datadog/browser-core';
import { makeRumPublicApi, startRum } from '@datadog/browser-rum-core';
import { makeRecorderApiStub } from '../boot/stubRecorderApi';
export { DefaultPrivacyLevel } from '@datadog/browser-core';
export var datadogRum = makeRumPublicApi(startRum, makeRecorderApiStub());
defineGlobal(getGlobalObject(), 'DD_RUM', datadogRum);
//# sourceMappingURL=main.js.map