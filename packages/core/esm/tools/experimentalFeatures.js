/**
 * LIMITATION:
 * For NPM setup, this feature flag singleton is shared between RUM and Logs product.
 * This means that an experimental flag set on the RUM product will be set on the Logs product.
 * So keep in mind that in certain configurations, your experimental feature flag may affect other products.
 *
 * FORMAT:
 * All feature flags should be snake_cased
 */
// We want to use a real enum (i.e. not a const enum) here, to be able to check whether an arbitrary
// string is an expected feature flag
// eslint-disable-next-line no-restricted-syntax
export var ExperimentalFeature;
(function (ExperimentalFeature) {
    ExperimentalFeature["PAGEHIDE"] = "pagehide";
    ExperimentalFeature["FEATURE_FLAGS"] = "feature_flags";
    ExperimentalFeature["RESOURCE_PAGE_STATES"] = "resource_page_states";
    ExperimentalFeature["PAGE_STATES"] = "page_states";
    ExperimentalFeature["COLLECT_FLUSH_REASON"] = "collect_flush_reason";
    ExperimentalFeature["NO_RESOURCE_DURATION_FROZEN_STATE"] = "no_resource_duration_frozen_state";
    ExperimentalFeature["SCROLLMAP"] = "scrollmap";
    ExperimentalFeature["INTERACTION_TO_NEXT_PAINT"] = "interaction_to_next_paint";
    ExperimentalFeature["DISABLE_REPLAY_INLINE_CSS"] = "disable_replay_inline_css";
})(ExperimentalFeature || (ExperimentalFeature = {}));
var enabledExperimentalFeatures = new Set();
export function addExperimentalFeatures(enabledFeatures) {
    enabledFeatures.forEach(function (flag) {
        enabledExperimentalFeatures.add(flag);
    });
}
export function isExperimentalFeatureEnabled(featureName) {
    return enabledExperimentalFeatures.has(featureName);
}
export function resetExperimentalFeatures() {
    enabledExperimentalFeatures.clear();
}
export function getExperimentalFeatures() {
    return enabledExperimentalFeatures;
}
//# sourceMappingURL=experimentalFeatures.js.map