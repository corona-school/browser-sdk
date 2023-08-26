import type { RumConfiguration } from '../configuration';
export declare function getDisplayContext(configuration: RumConfiguration): {
    viewport: {
        width: number;
        height: number;
    };
};
export declare function resetDisplayContext(): void;
