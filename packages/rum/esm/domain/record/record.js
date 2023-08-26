import { timeStampNow } from '@datadog/browser-core';
import { getViewportDimension, getScrollX, getScrollY } from '@datadog/browser-rum-core';
import { RecordType, IncrementalSource } from '../../types';
import { assembleIncrementalSnapshot } from './assembly';
import { serializeDocument } from './serialization';
import { initObservers } from './observers';
import { getVisualViewport } from './viewports';
import { createElementsScrollPositions } from './elementsScrollPositions';
import { initShadowRootsController } from './shadowRootsController';
export function record(options) {
    var emit = options.emit, configuration = options.configuration;
    // runtime checks for user options
    if (!emit) {
        throw new Error('emit function is required');
    }
    var elementsScrollPositions = createElementsScrollPositions();
    var mutationCb = function (mutation) {
        emit(assembleIncrementalSnapshot(IncrementalSource.Mutation, mutation));
    };
    var inputCb = function (s) { return emit(assembleIncrementalSnapshot(IncrementalSource.Input, s)); };
    var shadowRootsController = initShadowRootsController(configuration, { mutationCb: mutationCb, inputCb: inputCb });
    var takeFullSnapshot = function (timestamp, serializationContext) {
        if (timestamp === void 0) { timestamp = timeStampNow(); }
        if (serializationContext === void 0) { serializationContext = {
            status: 0 /* SerializationContextStatus.INITIAL_FULL_SNAPSHOT */,
            elementsScrollPositions: elementsScrollPositions,
            shadowRootsController: shadowRootsController,
        }; }
        var _a = getViewportDimension(), width = _a.width, height = _a.height;
        emit({
            data: {
                height: height,
                href: window.location.href,
                width: width,
            },
            type: RecordType.Meta,
            timestamp: timestamp,
        });
        emit({
            data: {
                has_focus: document.hasFocus(),
            },
            type: RecordType.Focus,
            timestamp: timestamp,
        });
        emit({
            data: {
                node: serializeDocument(document, configuration, serializationContext),
                initialOffset: {
                    left: getScrollX(),
                    top: getScrollY(),
                },
            },
            type: RecordType.FullSnapshot,
            timestamp: timestamp,
        });
        if (window.visualViewport) {
            emit({
                data: getVisualViewport(window.visualViewport),
                type: RecordType.VisualViewport,
                timestamp: timestamp,
            });
        }
    };
    takeFullSnapshot();
    var _a = initObservers(configuration, {
        lifeCycle: options.lifeCycle,
        configuration: configuration,
        elementsScrollPositions: elementsScrollPositions,
        inputCb: inputCb,
        mediaInteractionCb: function (p) {
            return emit(assembleIncrementalSnapshot(IncrementalSource.MediaInteraction, p));
        },
        mouseInteractionCb: function (mouseInteractionRecord) { return emit(mouseInteractionRecord); },
        mousemoveCb: function (positions, source) { return emit(assembleIncrementalSnapshot(source, { positions: positions })); },
        mutationCb: mutationCb,
        scrollCb: function (p) { return emit(assembleIncrementalSnapshot(IncrementalSource.Scroll, p)); },
        styleSheetCb: function (r) { return emit(assembleIncrementalSnapshot(IncrementalSource.StyleSheetRule, r)); },
        viewportResizeCb: function (d) { return emit(assembleIncrementalSnapshot(IncrementalSource.ViewportResize, d)); },
        frustrationCb: function (frustrationRecord) { return emit(frustrationRecord); },
        focusCb: function (data) {
            return emit({
                data: data,
                type: RecordType.Focus,
                timestamp: timeStampNow(),
            });
        },
        visualViewportResizeCb: function (data) {
            emit({
                data: data,
                type: RecordType.VisualViewport,
                timestamp: timeStampNow(),
            });
        },
        shadowRootsController: shadowRootsController,
    }), stopObservers = _a.stop, flushMutationsFromObservers = _a.flush;
    function flushMutations() {
        shadowRootsController.flush();
        flushMutationsFromObservers();
    }
    return {
        stop: function () {
            shadowRootsController.stop();
            stopObservers();
        },
        takeSubsequentFullSnapshot: function (timestamp) {
            flushMutations();
            takeFullSnapshot(timestamp, {
                shadowRootsController: shadowRootsController,
                status: 1 /* SerializationContextStatus.SUBSEQUENT_FULL_SNAPSHOT */,
                elementsScrollPositions: elementsScrollPositions,
            });
        },
        flushMutations: flushMutations,
        shadowRootsController: shadowRootsController,
    };
}
//# sourceMappingURL=record.js.map