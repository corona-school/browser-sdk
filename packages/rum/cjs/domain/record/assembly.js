"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assembleIncrementalSnapshot = void 0;
var browser_core_1 = require("@datadog/browser-core");
var types_1 = require("../../types");
function assembleIncrementalSnapshot(source, data) {
    return {
        data: (0, browser_core_1.assign)({
            source: source,
        }, data),
        type: types_1.RecordType.IncrementalSnapshot,
        timestamp: (0, browser_core_1.timeStampNow)(),
    };
}
exports.assembleIncrementalSnapshot = assembleIncrementalSnapshot;
//# sourceMappingURL=assembly.js.map