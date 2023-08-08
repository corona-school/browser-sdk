import { noop, PageExitReason, shallowClone, assign, elapsed, generateUUID, ONE_MINUTE, throttle, clocksNow, clocksOrigin, timeStampNow, display, looksLikeRelativeTime, setInterval, clearInterval, } from '@datadog/browser-core';
import { trackInitialViewTimings } from './trackInitialViewTimings';
import { trackViewMetrics } from './trackViewMetrics';
import { trackViewEventCounts } from './trackViewEventCounts';
export var THROTTLE_VIEW_UPDATE_PERIOD = 3000;
export var SESSION_KEEP_ALIVE_INTERVAL = 5 * ONE_MINUTE;
export function trackViews(location, lifeCycle, domMutationObservable, configuration, locationChangeObservable, areViewsTrackedAutomatically, webVitalTelemetryDebug, initialViewOptions) {
    var currentView = startNewView("initial_load" /* ViewLoadingType.INITIAL_LOAD */, clocksOrigin(), initialViewOptions);
    startViewLifeCycle();
    var locationChangeSubscription;
    if (areViewsTrackedAutomatically) {
        locationChangeSubscription = renewViewOnLocationChange(locationChangeObservable);
    }
    function startNewView(loadingType, startClocks, viewOptions) {
        return newView(lifeCycle, domMutationObservable, configuration, location, loadingType, webVitalTelemetryDebug, startClocks, viewOptions);
    }
    function startViewLifeCycle() {
        lifeCycle.subscribe(8 /* LifeCycleEventType.SESSION_RENEWED */, function () {
            // Renew view on session renewal
            currentView = startNewView("route_change" /* ViewLoadingType.ROUTE_CHANGE */, undefined, {
                name: currentView.name,
                service: currentView.service,
                version: currentView.version,
            });
        });
        lifeCycle.subscribe(7 /* LifeCycleEventType.SESSION_EXPIRED */, function () {
            currentView.end({ sessionIsActive: false });
        });
        // End the current view on page unload
        lifeCycle.subscribe(9 /* LifeCycleEventType.PAGE_EXITED */, function (pageExitEvent) {
            if (pageExitEvent.reason === PageExitReason.UNLOADING || pageExitEvent.reason === PageExitReason.PAGEHIDE) {
                currentView.end();
            }
        });
    }
    function renewViewOnLocationChange(locationChangeObservable) {
        return locationChangeObservable.subscribe(function (_a) {
            var oldLocation = _a.oldLocation, newLocation = _a.newLocation;
            if (areDifferentLocation(oldLocation, newLocation)) {
                currentView.end();
                currentView = startNewView("route_change" /* ViewLoadingType.ROUTE_CHANGE */);
            }
        });
    }
    return {
        addTiming: function (name, time) {
            if (time === void 0) { time = timeStampNow(); }
            currentView.addTiming(name, time);
        },
        startView: function (options, startClocks) {
            currentView.end({ endClocks: startClocks });
            currentView = startNewView("route_change" /* ViewLoadingType.ROUTE_CHANGE */, startClocks, options);
        },
        stop: function () {
            locationChangeSubscription === null || locationChangeSubscription === void 0 ? void 0 : locationChangeSubscription.unsubscribe();
            currentView.end();
        },
    };
}
function newView(lifeCycle, domMutationObservable, configuration, initialLocation, loadingType, webVitalTelemetryDebug, startClocks, viewOptions) {
    if (startClocks === void 0) { startClocks = clocksNow(); }
    // Setup initial values
    var id = generateUUID();
    var customTimings = {};
    var documentVersion = 0;
    var endClocks;
    var location = shallowClone(initialLocation);
    var sessionIsActive = true;
    var name;
    var service;
    var version;
    if (viewOptions) {
        name = viewOptions.name;
        service = viewOptions.service;
        version = viewOptions.version;
    }
    lifeCycle.notify(2 /* LifeCycleEventType.VIEW_CREATED */, {
        id: id,
        name: name,
        startClocks: startClocks,
        service: service,
        version: version,
    });
    // Update the view every time the measures are changing
    var _a = throttle(triggerViewUpdate, THROTTLE_VIEW_UPDATE_PERIOD, {
        leading: false,
    }), scheduleViewUpdate = _a.throttled, cancelScheduleViewUpdate = _a.cancel;
    var _b = trackViewMetrics(lifeCycle, domMutationObservable, configuration, scheduleViewUpdate, loadingType, startClocks, webVitalTelemetryDebug), setLoadEvent = _b.setLoadEvent, stopViewMetricsTracking = _b.stop, viewMetrics = _b.viewMetrics, getScrollMetrics = _b.getScrollMetrics;
    var _c = loadingType === "initial_load" /* ViewLoadingType.INITIAL_LOAD */
        ? trackInitialViewTimings(lifeCycle, webVitalTelemetryDebug, setLoadEvent, scheduleViewUpdate)
        : { scheduleStop: noop, timings: {} }, scheduleStopInitialViewTimingsTracking = _c.scheduleStop, timings = _c.timings;
    var _d = trackViewEventCounts(lifeCycle, id, scheduleViewUpdate), scheduleStopEventCountsTracking = _d.scheduleStop, eventCounts = _d.eventCounts;
    // Session keep alive
    var keepAliveIntervalId = setInterval(triggerViewUpdate, SESSION_KEEP_ALIVE_INTERVAL);
    // Initial view update
    triggerViewUpdate();
    function triggerViewUpdate() {
        cancelScheduleViewUpdate();
        documentVersion += 1;
        var currentEnd = endClocks === undefined ? timeStampNow() : endClocks.timeStamp;
        lifeCycle.notify(3 /* LifeCycleEventType.VIEW_UPDATED */, assign({
            customTimings: customTimings,
            documentVersion: documentVersion,
            id: id,
            name: name,
            service: service,
            version: version,
            loadingType: loadingType,
            location: location,
            startClocks: startClocks,
            timings: timings,
            duration: elapsed(startClocks.timeStamp, currentEnd),
            isActive: endClocks === undefined,
            sessionIsActive: sessionIsActive,
            eventCounts: eventCounts,
            scrollMetrics: getScrollMetrics(),
        }, viewMetrics));
    }
    return {
        name: name,
        service: service,
        version: version,
        end: function (options) {
            var _a, _b;
            if (options === void 0) { options = {}; }
            if (endClocks) {
                // view already ended
                return;
            }
            endClocks = (_a = options.endClocks) !== null && _a !== void 0 ? _a : clocksNow();
            sessionIsActive = (_b = options.sessionIsActive) !== null && _b !== void 0 ? _b : true;
            lifeCycle.notify(4 /* LifeCycleEventType.VIEW_ENDED */, { endClocks: endClocks });
            clearInterval(keepAliveIntervalId);
            stopViewMetricsTracking();
            scheduleStopInitialViewTimingsTracking();
            scheduleStopEventCountsTracking();
            triggerViewUpdate();
        },
        addTiming: function (name, time) {
            if (endClocks) {
                return;
            }
            var relativeTime = looksLikeRelativeTime(time) ? time : elapsed(startClocks.timeStamp, time);
            customTimings[sanitizeTiming(name)] = relativeTime;
            scheduleViewUpdate();
        },
    };
}
/**
 * Timing name is used as facet path that must contain only letters, digits, or the characters - _ . @ $
 */
function sanitizeTiming(name) {
    var sanitized = name.replace(/[^a-zA-Z0-9-_.@$]/g, '_');
    if (sanitized !== name) {
        display.warn("Invalid timing name: ".concat(name, ", sanitized to: ").concat(sanitized));
    }
    return sanitized;
}
function areDifferentLocation(currentLocation, otherLocation) {
    return (currentLocation.pathname !== otherLocation.pathname ||
        (!isHashAnAnchor(otherLocation.hash) &&
            getPathFromHash(otherLocation.hash) !== getPathFromHash(currentLocation.hash)));
}
function isHashAnAnchor(hash) {
    var correspondingId = hash.substr(1);
    return !!document.getElementById(correspondingId);
}
function getPathFromHash(hash) {
    var index = hash.indexOf('?');
    return index < 0 ? hash : hash.slice(0, index);
}
//# sourceMappingURL=trackViews.js.map