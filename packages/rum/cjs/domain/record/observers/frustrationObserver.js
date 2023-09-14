"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initFrustrationObserver = void 0;
var types_1 = require("../../../types");
function initFrustrationObserver(lifeCycle, frustrationCb, recordIds) {
    return lifeCycle.subscribe(10 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, function (data) {
        var _a, _b, _c;
        if (data.rawRumEvent.type === "action" /* RumEventType.ACTION */ &&
            data.rawRumEvent.action.type === "click" /* ActionType.CLICK */ &&
            ((_b = (_a = data.rawRumEvent.action.frustration) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.length) &&
            'events' in data.domainContext &&
            ((_c = data.domainContext.events) === null || _c === void 0 ? void 0 : _c.length)) {
            frustrationCb({
                timestamp: data.rawRumEvent.date,
                type: types_1.RecordType.FrustrationRecord,
                data: {
                    frustrationTypes: data.rawRumEvent.action.frustration.type,
                    recordIds: data.domainContext.events.map(function (e) { return recordIds.getIdForEvent(e); }),
                },
            });
        }
    }).unsubscribe;
}
exports.initFrustrationObserver = initFrustrationObserver;
//# sourceMappingURL=frustrationObserver.js.map