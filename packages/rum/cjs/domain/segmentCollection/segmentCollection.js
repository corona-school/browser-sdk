"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSegmentBytesLimit = exports.computeSegmentContext = exports.doStartSegmentCollection = exports.startSegmentCollection = exports.SEGMENT_BYTES_LIMIT = exports.SEGMENT_DURATION_LIMIT = void 0;
var browser_core_1 = require("@datadog/browser-core");
var buildReplayPayload_1 = require("./buildReplayPayload");
var segment_1 = require("./segment");
exports.SEGMENT_DURATION_LIMIT = 30 * browser_core_1.ONE_SECOND;
/**
 * beacon payload max queue size implementation is 64kb
 * ensure that we leave room for logs, rum and potential other users
 */
exports.SEGMENT_BYTES_LIMIT = 60000;
// Segments are the main data structure for session replays. They contain context information used
// for indexing or UI needs, and a list of records (RRWeb 'events', renamed to avoid confusing
// namings). They are stored without any processing from the intake, and fetched one after the
// other while a session is being replayed. Their encoding (deflate) are carefully crafted to allow
// concatenating multiple segments together. Segments have a size overhead (metadata), so our goal is to
// build segments containing as many records as possible while complying with the various flush
// strategies to guarantee a good replay quality.
//
// When the recording starts, a segment is initially created.  The segment is flushed (finalized and
// sent) based on various events (non-exhaustive list):
//
// * the page visibility change or becomes to unload
// * the segment duration reaches a limit
// * the encoded segment bytes count reaches a limit
// * ...
//
// A segment cannot be created without its context.  If the RUM session ends and no session id is
// available when creating a new segment, records will be ignored, until the session is renewed and
// a new session id is available.
//
// Empty segments (segments with no record) aren't useful and should be ignored.
//
// To help investigate session replays issues, each segment is created with a "creation reason",
// indicating why the session has been created.
function startSegmentCollection(lifeCycle, configuration, sessionManager, viewContexts, httpRequest, worker) {
    return doStartSegmentCollection(lifeCycle, configuration, function () { return computeSegmentContext(configuration.applicationId, sessionManager, viewContexts); }, httpRequest, worker);
}
exports.startSegmentCollection = startSegmentCollection;
function doStartSegmentCollection(lifeCycle, configuration, getSegmentContext, httpRequest, worker) {
    var state = {
        status: 0 /* SegmentCollectionStatus.WaitingForInitialRecord */,
        nextSegmentCreationReason: 'init',
    };
    var unsubscribeViewCreated = lifeCycle.subscribe(2 /* LifeCycleEventType.VIEW_CREATED */, function () {
        flushSegment('view_change');
    }).unsubscribe;
    var unsubscribePageExited = lifeCycle.subscribe(9 /* LifeCycleEventType.PAGE_EXITED */, function (pageExitEvent) {
        flushSegment(pageExitEvent.reason);
    }).unsubscribe;
    function flushSegment(flushReason) {
        if (state.status === 1 /* SegmentCollectionStatus.SegmentPending */) {
            state.segment.flush(flushReason);
            (0, browser_core_1.clearTimeout)(state.expirationTimeoutId);
        }
        if (flushReason !== 'stop') {
            state = {
                status: 0 /* SegmentCollectionStatus.WaitingForInitialRecord */,
                nextSegmentCreationReason: flushReason,
            };
        }
        else {
            state = {
                status: 2 /* SegmentCollectionStatus.Stopped */,
            };
        }
    }
    function createNewSegment(creationReason, initialRecord) {
        var context = getSegmentContext();
        if (!context) {
            return;
        }
        var segment = new segment_1.Segment(configuration, worker, context, creationReason, initialRecord, function (compressedSegmentBytesCount) {
            if (!segment.flushReason && compressedSegmentBytesCount > exports.SEGMENT_BYTES_LIMIT) {
                flushSegment('segment_bytes_limit');
            }
        }, function (data, rawSegmentBytesCount) {
            var payload = (0, buildReplayPayload_1.buildReplayPayload)(data, segment.metadata, rawSegmentBytesCount);
            if ((0, browser_core_1.isPageExitReason)(segment.flushReason)) {
                httpRequest.sendOnExit(payload);
            }
            else {
                httpRequest.send(payload);
            }
        });
        state = {
            status: 1 /* SegmentCollectionStatus.SegmentPending */,
            segment: segment,
            expirationTimeoutId: (0, browser_core_1.setTimeout)(function () {
                flushSegment('segment_duration_limit');
            }, exports.SEGMENT_DURATION_LIMIT),
        };
    }
    return {
        addRecord: function (record) {
            switch (state.status) {
                case 0 /* SegmentCollectionStatus.WaitingForInitialRecord */:
                    createNewSegment(state.nextSegmentCreationReason, record);
                    break;
                case 1 /* SegmentCollectionStatus.SegmentPending */:
                    state.segment.addRecord(record);
                    break;
            }
        },
        stop: function () {
            flushSegment('stop');
            unsubscribeViewCreated();
            unsubscribePageExited();
        },
    };
}
exports.doStartSegmentCollection = doStartSegmentCollection;
function computeSegmentContext(applicationId, sessionManager, viewContexts) {
    var session = sessionManager.findTrackedSession();
    var viewContext = viewContexts.findView();
    if (!session || !viewContext) {
        return undefined;
    }
    return {
        application: {
            id: applicationId,
        },
        session: {
            id: session.id,
        },
        view: {
            id: viewContext.id,
        },
    };
}
exports.computeSegmentContext = computeSegmentContext;
function setSegmentBytesLimit(newSegmentBytesLimit) {
    if (newSegmentBytesLimit === void 0) { newSegmentBytesLimit = 60000; }
    exports.SEGMENT_BYTES_LIMIT = newSegmentBytesLimit;
}
exports.setSegmentBytesLimit = setSegmentBytesLimit;
//# sourceMappingURL=segmentCollection.js.map