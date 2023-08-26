/**
 * LIMITATION:
 * For NPM setup, this feature flag singleton is shared between RUM and Logs product.
 * This means that an experimental flag set on the RUM product will be set on the Logs product.
 * So keep in mind that in certain configurations, your experimental feature flag may affect other products.
 *
 * FORMAT:
 * All feature flags should be snake_cased
 */
export declare enum ExperimentalFeature {
    PAGEHIDE = "pagehide",
    FEATURE_FLAGS = "feature_flags",
    RESOURCE_PAGE_STATES = "resource_page_states",
    PAGE_STATES = "page_states",
    COLLECT_FLUSH_REASON = "collect_flush_reason",
    NO_RESOURCE_DURATION_FROZEN_STATE = "no_resource_duration_frozen_state",
    SCROLLMAP = "scrollmap",
    DISABLE_REPLAY_INLINE_CSS = "disable_replay_inline_css"
}
export declare function addExperimentalFeatures(enabledFeatures: ExperimentalFeature[]): void;
export declare function isExperimentalFeatureEnabled(featureName: ExperimentalFeature): boolean;
export declare function resetExperimentalFeatures(): void;
export declare function getExperimentalFeatures(): Set<ExperimentalFeature>;
