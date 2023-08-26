"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveInitialDocumentResourceTiming = exports.startPerformanceCollection = exports.supportPerformanceTimingEvent = void 0;
var browser_core_1 = require("@datadog/browser-core");
var resourceUtils_1 = require("../domain/rumEventsCollection/resource/resourceUtils");
var getDocumentTraceId_1 = require("../domain/tracing/getDocumentTraceId");
function supportPerformanceObject() {
    return window.performance !== undefined && 'getEntries' in performance;
}
function supportPerformanceTimingEvent(entryType) {
    return (window.PerformanceObserver &&
        PerformanceObserver.supportedEntryTypes !== undefined &&
        PerformanceObserver.supportedEntryTypes.includes(entryType));
}
exports.supportPerformanceTimingEvent = supportPerformanceTimingEvent;
function startPerformanceCollection(lifeCycle, configuration) {
    retrieveInitialDocumentResourceTiming(configuration, function (timing) {
        handleRumPerformanceEntries(lifeCycle, configuration, [timing]);
    });
    if (supportPerformanceObject()) {
        var performanceEntries_1 = performance.getEntries();
        // Because the performance entry list can be quite large
        // delay the computation to prevent the SDK from blocking the main thread on init
        (0, browser_core_1.setTimeout)(function () { return handleRumPerformanceEntries(lifeCycle, configuration, performanceEntries_1); });
    }
    if (window.PerformanceObserver) {
        var handlePerformanceEntryList_1 = (0, browser_core_1.monitor)(function (entries) {
            return handleRumPerformanceEntries(lifeCycle, configuration, entries.getEntries());
        });
        var mainEntries = ['resource', 'navigation', 'longtask', 'paint'];
        var experimentalEntries = ['largest-contentful-paint', 'first-input', 'layout-shift'];
        try {
            // Experimental entries are not retrieved by performance.getEntries()
            // use a single PerformanceObserver with buffered flag by type
            // to get values that could happen before SDK init
            experimentalEntries.forEach(function (type) {
                var observer = new PerformanceObserver(handlePerformanceEntryList_1);
                observer.observe({ type: type, buffered: true });
            });
        }
        catch (e) {
            // Some old browser versions (ex: chrome 67) don't support the PerformanceObserver type and buffered options
            // In these cases, fallback to PerformanceObserver with entryTypes
            mainEntries.push.apply(mainEntries, experimentalEntries);
        }
        var mainObserver = new PerformanceObserver(handlePerformanceEntryList_1);
        mainObserver.observe({ entryTypes: mainEntries });
        if (supportPerformanceObject() && 'addEventListener' in performance) {
            // https://bugzilla.mozilla.org/show_bug.cgi?id=1559377
            (0, browser_core_1.addEventListener)(configuration, performance, 'resourcetimingbufferfull', function () {
                performance.clearResourceTimings();
            });
        }
    }
    if (!supportPerformanceTimingEvent('navigation')) {
        retrieveNavigationTiming(configuration, function (timing) {
            handleRumPerformanceEntries(lifeCycle, configuration, [timing]);
        });
    }
    if (!supportPerformanceTimingEvent('first-input')) {
        retrieveFirstInputTiming(configuration, function (timing) {
            handleRumPerformanceEntries(lifeCycle, configuration, [timing]);
        });
    }
}
exports.startPerformanceCollection = startPerformanceCollection;
function retrieveInitialDocumentResourceTiming(configuration, callback) {
    (0, browser_core_1.runOnReadyState)(configuration, 'interactive', function () {
        var timing;
        var forcedAttributes = {
            entryType: 'resource',
            initiatorType: resourceUtils_1.FAKE_INITIAL_DOCUMENT,
            traceId: (0, getDocumentTraceId_1.getDocumentTraceId)(document),
        };
        if (supportPerformanceTimingEvent('navigation') && performance.getEntriesByType('navigation').length > 0) {
            var navigationEntry = performance.getEntriesByType('navigation')[0];
            timing = (0, browser_core_1.assign)(navigationEntry.toJSON(), forcedAttributes);
        }
        else {
            var relativePerformanceTiming = computeRelativePerformanceTiming();
            timing = (0, browser_core_1.assign)(relativePerformanceTiming, {
                decodedBodySize: 0,
                duration: relativePerformanceTiming.responseEnd,
                name: window.location.href,
                startTime: 0,
            }, forcedAttributes);
        }
        callback(timing);
    });
}
exports.retrieveInitialDocumentResourceTiming = retrieveInitialDocumentResourceTiming;
function retrieveNavigationTiming(configuration, callback) {
    function sendFakeTiming() {
        callback((0, browser_core_1.assign)(computeRelativePerformanceTiming(), {
            entryType: 'navigation',
        }));
    }
    (0, browser_core_1.runOnReadyState)(configuration, 'complete', function () {
        // Send it a bit after the actual load event, so the "loadEventEnd" timing is accurate
        (0, browser_core_1.setTimeout)(sendFakeTiming);
    });
}
/**
 * first-input timing entry polyfill based on
 * https://github.com/GoogleChrome/web-vitals/blob/master/src/lib/polyfills/firstInputPolyfill.ts
 */
function retrieveFirstInputTiming(configuration, callback) {
    var startTimeStamp = (0, browser_core_1.dateNow)();
    var timingSent = false;
    var removeEventListeners = (0, browser_core_1.addEventListeners)(configuration, window, ["click" /* DOM_EVENT.CLICK */, "mousedown" /* DOM_EVENT.MOUSE_DOWN */, "keydown" /* DOM_EVENT.KEY_DOWN */, "touchstart" /* DOM_EVENT.TOUCH_START */, "pointerdown" /* DOM_EVENT.POINTER_DOWN */], function (evt) {
        // Only count cancelable events, which should trigger behavior important to the user.
        if (!evt.cancelable) {
            return;
        }
        // This timing will be used to compute the "first Input delay", which is the delta between
        // when the system received the event (e.g. evt.timeStamp) and when it could run the callback
        // (e.g. performance.now()).
        var timing = {
            entryType: 'first-input',
            processingStart: (0, browser_core_1.relativeNow)(),
            startTime: evt.timeStamp,
        };
        if (evt.type === "pointerdown" /* DOM_EVENT.POINTER_DOWN */) {
            sendTimingIfPointerIsNotCancelled(configuration, timing);
        }
        else {
            sendTiming(timing);
        }
    }, { passive: true, capture: true }).stop;
    /**
     * Pointer events are a special case, because they can trigger main or compositor thread behavior.
     * We differentiate these cases based on whether or not we see a pointercancel event, which are
     * fired when we scroll. If we're scrolling we don't need to report input delay since FID excludes
     * scrolling and pinch/zooming.
     */
    function sendTimingIfPointerIsNotCancelled(configuration, timing) {
        (0, browser_core_1.addEventListeners)(configuration, window, ["pointerup" /* DOM_EVENT.POINTER_UP */, "pointercancel" /* DOM_EVENT.POINTER_CANCEL */], function (event) {
            if (event.type === "pointerup" /* DOM_EVENT.POINTER_UP */) {
                sendTiming(timing);
            }
        }, { once: true });
    }
    function sendTiming(timing) {
        if (!timingSent) {
            timingSent = true;
            removeEventListeners();
            // In some cases the recorded delay is clearly wrong, e.g. it's negative or it's larger than
            // the time between now and when the page was loaded.
            // - https://github.com/GoogleChromeLabs/first-input-delay/issues/4
            // - https://github.com/GoogleChromeLabs/first-input-delay/issues/6
            // - https://github.com/GoogleChromeLabs/first-input-delay/issues/7
            var delay = timing.processingStart - timing.startTime;
            if (delay >= 0 && delay < (0, browser_core_1.dateNow)() - startTimeStamp) {
                callback(timing);
            }
        }
    }
}
function computeRelativePerformanceTiming() {
    var result = {};
    var timing = performance.timing;
    for (var key in timing) {
        if ((0, browser_core_1.isNumber)(timing[key])) {
            var numberKey = key;
            var timingElement = timing[numberKey];
            result[numberKey] = timingElement === 0 ? 0 : (0, browser_core_1.getRelativeTime)(timingElement);
        }
    }
    return result;
}
function handleRumPerformanceEntries(lifeCycle, configuration, entries) {
    var rumPerformanceEntries = entries.filter(function (entry) {
        return entry.entryType === 'resource' ||
            entry.entryType === 'navigation' ||
            entry.entryType === 'paint' ||
            entry.entryType === 'longtask' ||
            entry.entryType === 'largest-contentful-paint' ||
            entry.entryType === 'first-input' ||
            entry.entryType === 'layout-shift';
    });
    var rumAllowedPerformanceEntries = rumPerformanceEntries.filter(function (entry) { return !isIncompleteNavigation(entry) && !isForbiddenResource(configuration, entry); });
    if (rumAllowedPerformanceEntries.length) {
        lifeCycle.notify(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, rumAllowedPerformanceEntries);
    }
}
function isIncompleteNavigation(entry) {
    return entry.entryType === 'navigation' && entry.loadEventEnd <= 0;
}
function isForbiddenResource(configuration, entry) {
    return entry.entryType === 'resource' && !(0, resourceUtils_1.isAllowedRequestUrl)(configuration, entry.name);
}
//# sourceMappingURL=performanceCollection.js.map