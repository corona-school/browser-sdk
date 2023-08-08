import { addTelemetryError } from '../domain/telemetry';
import { monitor } from '../tools/monitor';
import { addEventListener } from '../browser/addEventListener';
import { newRetryState, sendWithRetryStrategy } from './sendWithRetryStrategy';
export function createHttpRequest(endpointBuilder, bytesLimit, reportError) {
    var retryState = newRetryState();
    var sendStrategyForRetry = function (payload, onResponse) {
        return fetchKeepAliveStrategy(endpointBuilder, bytesLimit, payload, onResponse);
    };
    return {
        send: function (payload) {
            sendWithRetryStrategy(payload, retryState, sendStrategyForRetry, endpointBuilder.endpointType, reportError);
        },
        /**
         * Since fetch keepalive behaves like regular fetch on Firefox,
         * keep using sendBeaconStrategy on exit
         */
        sendOnExit: function (payload) {
            sendBeaconStrategy(endpointBuilder, bytesLimit, payload);
        },
    };
}
function sendBeaconStrategy(endpointBuilder, bytesLimit, _a) {
    var data = _a.data, bytesCount = _a.bytesCount, flushReason = _a.flushReason;
    var canUseBeacon = !!navigator.sendBeacon && bytesCount < bytesLimit;
    if (canUseBeacon) {
        try {
            var beaconUrl = endpointBuilder.build('beacon', flushReason);
            var isQueued = navigator.sendBeacon(beaconUrl, data);
            if (isQueued) {
                return;
            }
        }
        catch (e) {
            reportBeaconError(e);
        }
    }
    var xhrUrl = endpointBuilder.build('xhr', flushReason);
    sendXHR(xhrUrl, data);
}
var hasReportedBeaconError = false;
function reportBeaconError(e) {
    if (!hasReportedBeaconError) {
        hasReportedBeaconError = true;
        addTelemetryError(e);
    }
}
export function fetchKeepAliveStrategy(endpointBuilder, bytesLimit, _a, onResponse) {
    var data = _a.data, bytesCount = _a.bytesCount, flushReason = _a.flushReason, retry = _a.retry;
    var canUseKeepAlive = isKeepAliveSupported() && bytesCount < bytesLimit;
    if (canUseKeepAlive) {
        var fetchUrl = endpointBuilder.build('fetch', flushReason, retry);
        fetch(fetchUrl, { method: 'POST', body: data, keepalive: true, mode: 'cors' }).then(monitor(function (response) { return onResponse === null || onResponse === void 0 ? void 0 : onResponse({ status: response.status, type: response.type }); }), monitor(function () {
            var xhrUrl = endpointBuilder.build('xhr', flushReason, retry);
            // failed to queue the request
            sendXHR(xhrUrl, data, onResponse);
        }));
    }
    else {
        var xhrUrl = endpointBuilder.build('xhr', flushReason, retry);
        sendXHR(xhrUrl, data, onResponse);
    }
}
function isKeepAliveSupported() {
    // Request can throw, cf https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#errors
    try {
        return window.Request && 'keepalive' in new Request('http://a');
    }
    catch (_a) {
        return false;
    }
}
export function sendXHR(url, data, onResponse) {
    var request = new XMLHttpRequest();
    request.open('POST', url, true);
    addEventListener(request, 'loadend', function () {
        onResponse === null || onResponse === void 0 ? void 0 : onResponse({ status: request.status });
    }, {
        // prevent multiple onResponse callbacks
        // if the xhr instance is reused by a third party
        once: true,
    });
    request.send(data);
}
//# sourceMappingURL=httpRequest.js.map