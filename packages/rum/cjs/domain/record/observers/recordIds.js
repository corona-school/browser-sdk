"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRecordIds = void 0;
function initRecordIds() {
    var recordIds = new WeakMap();
    var nextId = 1;
    return {
        getIdForEvent: function (event) {
            if (!recordIds.has(event)) {
                recordIds.set(event, nextId++);
            }
            return recordIds.get(event);
        },
    };
}
exports.initRecordIds = initRecordIds;
//# sourceMappingURL=recordIds.js.map