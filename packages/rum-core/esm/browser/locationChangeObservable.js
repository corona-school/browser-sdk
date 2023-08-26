import { addEventListener, instrumentMethodAndCallOriginal, Observable, shallowClone, } from '@datadog/browser-core';
export function createLocationChangeObservable(configuration, location) {
    var currentLocation = shallowClone(location);
    var observable = new Observable(function () {
        var stopHistoryTracking = trackHistory(configuration, onLocationChange).stop;
        var stopHashTracking = trackHash(configuration, onLocationChange).stop;
        return function () {
            stopHistoryTracking();
            stopHashTracking();
        };
    });
    function onLocationChange() {
        if (currentLocation.href === location.href) {
            return;
        }
        var newLocation = shallowClone(location);
        observable.notify({
            newLocation: newLocation,
            oldLocation: currentLocation,
        });
        currentLocation = newLocation;
    }
    return observable;
}
function trackHistory(configuration, onHistoryChange) {
    var stopInstrumentingPushState = instrumentMethodAndCallOriginal(history, 'pushState', {
        after: onHistoryChange,
    }).stop;
    var stopInstrumentingReplaceState = instrumentMethodAndCallOriginal(history, 'replaceState', {
        after: onHistoryChange,
    }).stop;
    var removeListener = addEventListener(configuration, window, "popstate" /* DOM_EVENT.POP_STATE */, onHistoryChange).stop;
    return {
        stop: function () {
            stopInstrumentingPushState();
            stopInstrumentingReplaceState();
            removeListener();
        },
    };
}
function trackHash(configuration, onHashChange) {
    return addEventListener(configuration, window, "hashchange" /* DOM_EVENT.HASH_CHANGE */, onHashChange);
}
//# sourceMappingURL=locationChangeObservable.js.map