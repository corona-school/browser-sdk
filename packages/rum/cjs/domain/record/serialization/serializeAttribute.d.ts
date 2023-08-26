import type { RumConfiguration } from '@datadog/browser-rum-core';
import { NodePrivacyLevel } from '../../../constants';
export declare function serializeAttribute(element: Element, nodePrivacyLevel: NodePrivacyLevel, attributeName: string, configuration: RumConfiguration): string | number | boolean | null;
