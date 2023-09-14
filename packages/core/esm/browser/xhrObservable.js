import { instrumentMethodAndCallOriginal } from '../tools/instrumentMethod';
import { Observable } from '../tools/observable';
import { elapsed, relativeNow, clocksNow, timeStampNow } from '../tools/utils/timeUtils';
import { normalizeUrl } from '../tools/utils/urlPolyfill';
import { shallowClone } from '../tools/utils/objectUtils';
import { addEventListener } from './addEventListener';
var xhrObservable;
var xhrContexts = new WeakMap();
export function initXhrObservable(configuration) {
    if (!xhrObservable) {
        xhrObservable = createXhrObservable(configuration);
    }
    return xhrObservable;
}
function createXhrObservable(configuration) {
    var observable = new Observable(function () {
        var stopInstrumentingStart = instrumentMethodAndCallOriginal(XMLHttpRequest.prototype, 'open', {
            before: openXhr,
        }).stop;
        var stopInstrumentingSend = instrumentMethodAndCallOriginal(XMLHttpRequest.prototype, 'send', {
            before: function () {
                sendXhr.call(this, configuration, observable);
            },
        }).stop;
        var stopInstrumentingAbort = instrumentMethodAndCallOriginal(XMLHttpRequest.prototype, 'abort', {
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
        url: normalizeUrl(String(url)),
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
    startContext.startTime = relativeNow();
    startContext.startClocks = clocksNow();
    startContext.isAborted = false;
    startContext.xhr = this;
    var hasBeenReported = false;
    var stopInstrumentingOnReadyStateChange = instrumentMethodAndCallOriginal(this, 'onreadystatechange', {
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
        completeContext.duration = elapsed(startContext.startClocks.timeStamp, timeStampNow());
        completeContext.status = _this.status;
        observable.notify(shallowClone(completeContext));
    };
    var unsubscribeLoadEndListener = addEventListener(configuration, this, 'loadend', onEnd).stop;
    observable.notify(startContext);
}
function abortXhr() {
    var context = xhrContexts.get(this);
    if (context) {
        context.isAborted = true;
    }
}
//# sourceMappingURL=xhrObservable.js.map