"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.record = void 0;
var browser_core_1 = require("@datadog/browser-core");
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var types_1 = require("../../types");
var assembly_1 = require("./assembly");
var serialization_1 = require("./serialization");
var observers_1 = require("./observers");
var viewports_1 = require("./viewports");
var elementsScrollPositions_1 = require("./elementsScrollPositions");
var shadowRootsController_1 = require("./shadowRootsController");
function record(options) {
    var emit = options.emit, configuration = options.configuration;
    // runtime checks for user options
    if (!emit) {
        throw new Error('emit function is required');
    }
    var elementsScrollPositions = (0, elementsScrollPositions_1.createElementsScrollPositions)();
    var mutationCb = function (mutation) {
        emit((0, assembly_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.Mutation, mutation));
    };
    var inputCb = function (s) { return emit((0, assembly_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.Input, s)); };
    var shadowRootsController = (0, shadowRootsController_1.initShadowRootsController)(configuration, { mutationCb: mutationCb, inputCb: inputCb });
    var takeFullSnapshot = function (timestamp, serializationContext) {
        if (timestamp === void 0) { timestamp = (0, browser_core_1.timeStampNow)(); }
        if (serializationContext === void 0) { serializationContext = {
            status: 0 /* SerializationContextStatus.INITIAL_FULL_SNAPSHOT */,
            elementsScrollPositions: elementsScrollPositions,
            shadowRootsController: shadowRootsController,
        }; }
        var _a = (0, browser_rum_core_1.getViewportDimension)(), width = _a.width, height = _a.height;
        emit({
            data: {
                height: height,
                href: window.location.href,
                width: width,
            },
            type: types_1.RecordType.Meta,
            timestamp: timestamp,
        });
        emit({
            data: {
                has_focus: document.hasFocus(),
            },
            type: types_1.RecordType.Focus,
            timestamp: timestamp,
        });
        emit({
            data: {
                node: (0, serialization_1.serializeDocument)(document, configuration, serializationContext),
                initialOffset: {
                    left: (0, browser_rum_core_1.getScrollX)(),
                    top: (0, browser_rum_core_1.getScrollY)(),
                },
            },
            type: types_1.RecordType.FullSnapshot,
            timestamp: timestamp,
        });
        if (window.visualViewport) {
            emit({
                data: (0, viewports_1.getVisualViewport)(window.visualViewport),
                type: types_1.RecordType.VisualViewport,
                timestamp: timestamp,
            });
        }
    };
    takeFullSnapshot();
    var _a = (0, observers_1.initObservers)(configuration, {
        lifeCycle: options.lifeCycle,
        configuration: configuration,
        elementsScrollPositions: elementsScrollPositions,
        inputCb: inputCb,
        mediaInteractionCb: function (p) {
            return emit((0, assembly_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.MediaInteraction, p));
        },
        mouseInteractionCb: function (mouseInteractionRecord) { return emit(mouseInteractionRecord); },
        mousemoveCb: function (positions, source) { return emit((0, assembly_1.assembleIncrementalSnapshot)(source, { positions: positions })); },
        mutationCb: mutationCb,
        scrollCb: function (p) { return emit((0, assembly_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.Scroll, p)); },
        styleSheetCb: function (r) { return emit((0, assembly_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.StyleSheetRule, r)); },
        viewportResizeCb: function (d) { return emit((0, assembly_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.ViewportResize, d)); },
        frustrationCb: function (frustrationRecord) { return emit(frustrationRecord); },
        focusCb: function (data) {
            return emit({
                data: data,
                type: types_1.RecordType.Focus,
                timestamp: (0, browser_core_1.timeStampNow)(),
            });
        },
        visualViewportResizeCb: function (data) {
            emit({
                data: data,
                type: types_1.RecordType.VisualViewport,
                timestamp: (0, browser_core_1.timeStampNow)(),
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
exports.record = record;
//# sourceMappingURL=record.js.map