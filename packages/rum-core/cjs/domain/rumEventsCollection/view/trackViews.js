"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackViews = exports.SESSION_KEEP_ALIVE_INTERVAL = exports.THROTTLE_VIEW_UPDATE_PERIOD = void 0;
var browser_core_1 = require("@datadog/browser-core");
var trackInitialViewTimings_1 = require("./trackInitialViewTimings");
var trackViewMetrics_1 = require("./trackViewMetrics");
var trackViewEventCounts_1 = require("./trackViewEventCounts");
exports.THROTTLE_VIEW_UPDATE_PERIOD = 3000;
exports.SESSION_KEEP_ALIVE_INTERVAL = 5 * browser_core_1.ONE_MINUTE;
function trackViews(location, lifeCycle, domMutationObservable, configuration, locationChangeObservable, areViewsTrackedAutomatically, webVitalTelemetryDebug, initialViewOptions) {
    var currentView = startNewView("initial_load" /* ViewLoadingType.INITIAL_LOAD */, (0, browser_core_1.clocksOrigin)(), initialViewOptions);
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
            if (pageExitEvent.reason === browser_core_1.PageExitReason.UNLOADING || pageExitEvent.reason === browser_core_1.PageExitReason.PAGEHIDE) {
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
            if (time === void 0) { time = (0, browser_core_1.timeStampNow)(); }
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
exports.trackViews = trackViews;
function newView(lifeCycle, domMutationObservable, configuration, initialLocation, loadingType, webVitalTelemetryDebug, startClocks, viewOptions) {
    if (startClocks === void 0) { startClocks = (0, browser_core_1.clocksNow)(); }
    // Setup initial values
    var id = (0, browser_core_1.generateUUID)();
    var customTimings = {};
    var documentVersion = 0;
    var endClocks;
    var location = (0, browser_core_1.shallowClone)(initialLocation);
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
    var _a = (0, browser_core_1.throttle)(triggerViewUpdate, exports.THROTTLE_VIEW_UPDATE_PERIOD, {
        leading: false,
    }), scheduleViewUpdate = _a.throttled, cancelScheduleViewUpdate = _a.cancel;
    var _b = (0, trackViewMetrics_1.trackViewMetrics)(lifeCycle, domMutationObservable, configuration, scheduleViewUpdate, loadingType, startClocks, webVitalTelemetryDebug), setLoadEvent = _b.setLoadEvent, stopViewMetricsTracking = _b.stop, viewMetrics = _b.viewMetrics, getScrollMetrics = _b.getScrollMetrics;
    var _c = loadingType === "initial_load" /* ViewLoadingType.INITIAL_LOAD */
        ? (0, trackInitialViewTimings_1.trackInitialViewTimings)(lifeCycle, webVitalTelemetryDebug, setLoadEvent, scheduleViewUpdate)
        : { scheduleStop: browser_core_1.noop, timings: {} }, scheduleStopInitialViewTimingsTracking = _c.scheduleStop, timings = _c.timings;
    var _d = (0, trackViewEventCounts_1.trackViewEventCounts)(lifeCycle, id, scheduleViewUpdate), scheduleStopEventCountsTracking = _d.scheduleStop, eventCounts = _d.eventCounts;
    // Session keep alive
    var keepAliveIntervalId = (0, browser_core_1.setInterval)(triggerViewUpdate, exports.SESSION_KEEP_ALIVE_INTERVAL);
    // Initial view update
    triggerViewUpdate();
    function triggerViewUpdate() {
        cancelScheduleViewUpdate();
        documentVersion += 1;
        var currentEnd = endClocks === undefined ? (0, browser_core_1.timeStampNow)() : endClocks.timeStamp;
        lifeCycle.notify(3 /* LifeCycleEventType.VIEW_UPDATED */, (0, browser_core_1.assign)({
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
            duration: (0, browser_core_1.elapsed)(startClocks.timeStamp, currentEnd),
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
            endClocks = (_a = options.endClocks) !== null && _a !== void 0 ? _a : (0, browser_core_1.clocksNow)();
            sessionIsActive = (_b = options.sessionIsActive) !== null && _b !== void 0 ? _b : true;
            lifeCycle.notify(4 /* LifeCycleEventType.VIEW_ENDED */, { endClocks: endClocks });
            (0, browser_core_1.clearInterval)(keepAliveIntervalId);
            stopViewMetricsTracking();
            scheduleStopInitialViewTimingsTracking();
            scheduleStopEventCountsTracking();
            triggerViewUpdate();
        },
        addTiming: function (name, time) {
            if (endClocks) {
                return;
            }
            var relativeTime = (0, browser_core_1.looksLikeRelativeTime)(time) ? time : (0, browser_core_1.elapsed)(startClocks.timeStamp, time);
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
        browser_core_1.display.warn("Invalid timing name: ".concat(name, ", sanitized to: ").concat(sanitized));
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