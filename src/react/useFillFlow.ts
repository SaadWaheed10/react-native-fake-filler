import { useCallback } from 'react';
import { useFakeFiller } from './useFakeFiller';
import { runFillFlow, type FlowStep, type FillFlowOptions } from '../core/wizard';
import type { FillOptions, FillResult } from '../core/types';

/**
 * Hook for multi-step / wizard fills scoped to the nearest provider.
 *
 * @example
 * ```ts
 * const { fillFlow } = useFillFlow();
 * await fillFlow([
 *   { id: 'signup', options: { scenario: 'signup' }, afterFill: tapNext },
 *   { id: 'otp', delayMs: 400, options: { overrides: { otp: '123456' } } },
 * ]);
 * ```
 */
export function useFillFlow() {
  const { fill } = useFakeFiller();

  const fillFlow = useCallback(
    (steps: FlowStep[], flowOptions?: FillFlowOptions) =>
      runFillFlow(steps, (options?: FillOptions) => fill(options), flowOptions),
    [fill]
  );

  return { fillFlow, fill: fill as (options?: FillOptions) => FillResult };
}
