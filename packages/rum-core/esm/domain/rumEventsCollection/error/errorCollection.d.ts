import type { Context, ClocksState } from '@datadog/browser-core';
import type { LifeCycle } from '../../lifeCycle';
import type { FeatureFlagContexts } from '../../contexts/featureFlagContext';
import type { CommonContext } from '../../contexts/commonContext';
import type { PageStateHistory } from '../../contexts/pageStateHistory';
export interface ProvidedError {
    startClocks: ClocksState;
    error: unknown;
    context?: Context;
    handlingStack: string;
}
export declare function startErrorCollection(lifeCycle: LifeCycle, pageStateHistory: PageStateHistory, featureFlagContexts: FeatureFlagContexts): {
    addError: ({ error, handlingStack, startClocks, context: customerContext }: ProvidedError, savedCommonContext?: CommonContext | undefined) => void;
};
export declare function doStartErrorCollection(lifeCycle: LifeCycle, pageStateHistory: PageStateHistory, featureFlagContexts: FeatureFlagContexts): {
    addError: ({ error, handlingStack, startClocks, context: customerContext }: ProvidedError, savedCommonContext?: CommonContext) => void;
};
