import { useCallback } from 'react';
import { fakeFillerEngine } from '../core/FakeFiller';
import { useFakeFillerContext } from './context';
import type { FillOptions } from '../core/types';

export interface UseFakeFillerResult {
  /** Fills every `FFTextInput` (or manually registered field) mounted under the nearest provider. */
  fill: (options?: FillOptions) => { filled: number; skipped: number };
  /** Alias for `fill()` — regenerates fresh values for every field, same as pressing the dev toolbar button again. */
  regenerate: (options?: FillOptions) => { filled: number; skipped: number };
  /** Clears every registered field back to an empty string. */
  clear: () => void;
  /** Number of fields currently registered under the nearest provider. */
  fieldCount: () => number;
}

/**
 * The primary hook for triggering FakeFiller from inside a component, e.g.
 * a custom "Fill Form" button.
 *
 * ```tsx
 * const { fill, clear } = useFakeFiller();
 * <Button title="Fill" onPress={() => fill()} />
 * ```
 *
 * Must be called from a component rendered under `<FakeFillerProvider>`.
 * Outside a provider, `fill`/`regenerate`/`clear` are safe no-ops so the
 * hook can still be used in code paths that run in production.
 */
export function useFakeFiller(): UseFakeFillerResult {
  const ctx = useFakeFillerContext();

  const fill = useCallback(
    (options?: FillOptions) => {
      if (!ctx) return { filled: 0, skipped: 0 };
      return ctx.fillScreen(options);
    },
    [ctx]
  );

  const clear = useCallback(() => {
    ctx?.clearFields();
  }, [ctx]);

  const fieldCount = useCallback(() => ctx?.fieldCount() ?? 0, [ctx]);

  return { fill, regenerate: fill, clear, fieldCount };
}

/** Re-exported for convenience when a component needs the raw engine (rare). */
export { fakeFillerEngine };
