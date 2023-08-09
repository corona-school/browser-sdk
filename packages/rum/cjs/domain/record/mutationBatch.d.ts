import type { RumMutationRecord } from './observers';
export declare function createMutationBatch(processMutationBatch: (mutations: RumMutationRecord[]) => void): {
    addMutations: (mutations: RumMutationRecord[]) => void;
    flush: () => void;
    stop: () => void;
};
