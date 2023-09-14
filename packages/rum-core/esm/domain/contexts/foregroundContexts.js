import { toServerDuration } from '@datadog/browser-core';
// Todo: Remove in the next major release
export function mapToForegroundPeriods(pageStateServerEntries, duration) {
    var foregroundPeriods = [];
    for (var i = 0; i < pageStateServerEntries.length; i++) {
        var current = pageStateServerEntries[i];
        var next = pageStateServerEntries[i + 1];
        if (current.state === "active" /* PageState.ACTIVE */) {
            var start = current.start >= 0 ? current.start : 0;
            var end = next ? next.start : toServerDuration(duration);
            foregroundPeriods.push({
                start: start,
                duration: (end - start),
            });
        }
    }
    return foregroundPeriods;
}
//# sourceMappingURL=foregroundContexts.js.map