"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initXhrObservable = void 0;
var instrumentMethod_1 = require("../tools/instrumentMethod");
var observable_1 = require("../tools/observable");
var timeUtils_1 = require("../tools/utils/timeUtils");
var urlPolyfill_1 = require("../tools/utils/urlPolyfill");
var objectUtils_1 = require("../tools/utils/objectUtils");
var addEventListener_1 = require("./addEventListener");
var xhrObservable;
var xhrContexts = new WeakMap();
function initXhrObservable(configuration) {
    if (!xhrObservable) {
        xhrObservable = createXhrObservable(configuration);
    }
    return xhrObservable;
}
exports.initXhrObservable = initXhrObservable;
function createXhrObservable(configuration) {
    var observable = new observable_1.Observable(function () {
        var stopInstrumentingStart = (0, instrumentMethod_1.instrumentMethodAndCallOriginal)(XMLHttpRequest.prototype, 'open', {
            before: openXhr,
        }).stop;
        var stopInstrumentingSend = (0, instrumentMethod_1.instrumentMethodAndCallOriginal)(XMLHttpRequest.prototype, 'send', {
            before: function () {
                sendXhr.call(this, configuration, observable);
            },
        }).stop;
        var stopInstrumentingAbort = (0, instrumentMethod_1.instrumentMethodAndCallOriginal)(XMLHttpRequest.prototype, 'abort', {
            before: abortXhr,
        }).stop;
        return function () {
            stopInstrumentingStart();
            stopInstrumentingSend();
            stopInstrumentingAbort();
        };
    });
    return observable;
}
function openXhr(method, url) {
    xhrContexts.set(this, {
        state: 'open',
        method: method,
        url: (0, urlPolyfill_1.normalizeUrl)(String(url)),
    });
}
function sendXhr(configuration, observable) {
    var _this = this;
    var context = xhrContexts.get(this);
    if (!context) {
        return;
    }
    var startContext = context;
    startContext.state = 'start';
    startContext.startTime = (0, timeUtils_1.relativeNow)();
    startContext.startClocks = (0, timeUtils_1.clocksNow)();
    startContext.isAborted = false;
    startContext.xhr = this;
    var hasBeenReported = false;
    var stopInstrumentingOnReadyStateChange = (0, instrumentMethod_1.instrumentMethodAndCallOriginal)(this, 'onreadystatechange', {
        before: function () {
            if (this.readyState === XMLHttpRequest.DONE) {
                // Try to report the XHR as soon as possible, because the XHR may be mutated by the
                // application during a future event. For example, Angular is calling .abort() on
                // completed requests during a onreadystatechange event, so the status becomes '0'
                // before the request is collected.
                onEnd();
            }
        },
    }).stop;
    var onEnd = function () {
        unsubscribeLoadEndListener();
        stopInstrumentingOnReadyStateChange();
        if (hasBeenReported) {
            return;
        }
        hasBeenReported = true;
        var completeContext = context;
        completeContext.state = 'complete';
        completeContext.duration = (0, timeUtils_1.elapsed)(startContext.startClocks.timeStamp, (0, timeUtils_1.timeStampNow)());
        completeContext.status = _this.status;
        observable.notify((0, objectUtils_1.shallowClone)(completeContext));
    };
    var unsubscribeLoadEndListener = (0, addEventListener_1.addEventListener)(configuration, this, 'loadend', onEnd).stop;
    observable.notify(startContext);
}
function abortXhr() {
    var context = xhrContexts.get(this);
    if (context) {
        context.isAborted = true;
    }
}
//# sourceMappingURL=xhrObservable.js.map