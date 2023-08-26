"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapToForegroundPeriods = void 0;
var browser_core_1 = require("@datadog/browser-core");
// Todo: Remove in the next major release
function mapToForegroundPeriods(pageStateServerEntries, duration) {
    var foregroundPeriods = [];
    for (var i = 0; i < pageStateServerEntries.length; i++) {
        var current = pageStateServerEntries[i];
        var next = pageStateServerEntries[i + 1];
        if (current.state === "active" /* PageState.ACTIVE */) {
            var start = current.start >= 0 ? current.start : 0;
            var end = next ? next.start : (0, browser_core_1.toServerDuration)(duration);
            foregroundPeriods.push({
                start: start,
                duration: (end - start),
            });
        }
    }
    return foregroundPeriods;
}
exports.mapToForegroundPeriods = mapToForegroundPeriods;
//# sourceMappingURL=foregroundContexts.js.map