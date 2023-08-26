import { initInputObserver, initMutationObserver } from './observers';
export var initShadowRootsController = function (configuration, _a) {
    var mutationCb = _a.mutationCb, inputCb = _a.inputCb;
    var controllerByShadowRoot = new Map();
    var shadowRootsController = {
        addShadowRoot: function (shadowRoot) {
            var _a = initMutationObserver(mutationCb, configuration, shadowRootsController, shadowRoot), stopMutationObserver = _a.stop, flush = _a.flush;
            // the change event no do bubble up across the shadow root, we have to listen on the shadow root
            var stopInputObserver = initInputObserver(configuration, inputCb, shadowRoot);
            controllerByShadowRoot.set(shadowRoot, {
                flush: flush,
                stop: function () {
                    stopMutationObserver();
                    stopInputObserver();
                },
            });
        },
        removeShadowRoot: function (shadowRoot) {
            var entry = controllerByShadowRoot.get(shadowRoot);
            if (!entry) {
                // unidentified root cause: observed in some cases with shadow DOM added by browser extensions
                return;
            }
            entry.stop();
            controllerByShadowRoot.delete(shadowRoot);
        },
        stop: function () {
            controllerByShadowRoot.forEach(function (_a) {
                var stop = _a.stop;
                return stop();
            });
        },
        flush: function () {
            controllerByShadowRoot.forEach(function (_a) {
                var flush = _a.flush;
                return flush();
            });
        },
    };
    return shadowRootsController;
};
//# sourceMappingURL=shadowRootsController.js.map