import type { FillOptions, FillResult } from './types';

export interface FlowStep {
  /** Stable id for logging / debugging */
  id: string;
  /** Options applied when filling this step's screen */
  options?: FillOptions;
  /**
   * Called after fill. Return false to abort the flow.
   * Use this to tap "Next", wait for navigation, etc.
   */
  afterFill?: (result: FillResult) => void | boolean | Promise<void | boolean>;
  /** Optional delay (ms) before filling this step — lets navigation settle */
  delayMs?: number;
}

export interface FillFlowOptions {
  /** Abort remaining steps if a step fills 0 fields */
  abortOnEmpty?: boolean;
  onStep?: (step: FlowStep, result: FillResult, index: number) => void;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Runs a multi-step / wizard fill. Caller supplies a `fillFn` that fills
 * whatever is currently on screen (usually FakeFiller.fillScreen or a
 * provider-scoped fill from useFakeFiller).
 *
 * @example
 * ```ts
 * await FakeFiller.fillFlow([
 *   { id: 'account', options: { scenario: 'signup' }, afterFill: () => tapNext() },
 *   { id: 'address', delayMs: 300, afterFill: () => tapNext() },
 *   { id: 'otp', options: { overrides: { otp: '123456' } } },
 * ], (opts) => FakeFiller.fillScreen(opts));
 * ```
 */
export async function runFillFlow(
  steps: FlowStep[],
  fillFn: (options?: FillOptions) => FillResult,
  flowOptions: FillFlowOptions = {}
): Promise<{ results: FillResult[]; completed: number; aborted: boolean }> {
  const results: FillResult[] = [];
  let completed = 0;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i] as FlowStep;
    if (step.delayMs && step.delayMs > 0) {
      await sleep(step.delayMs);
    }

    const result = fillFn(step.options);
    results.push(result);
    flowOptions.onStep?.(step, result, i);

    if (flowOptions.abortOnEmpty && result.filled === 0) {
      return { results, completed, aborted: true };
    }

    if (step.afterFill) {
      const cont = await step.afterFill(result);
      if (cont === false) {
        return { results, completed, aborted: true };
      }
    }

    completed++;
  }

  return { results, completed, aborted: false };
}
