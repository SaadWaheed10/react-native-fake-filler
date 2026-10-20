import { useCallback } from 'react';
import { useFakeFillerContext } from './context';
import { fakeFillerEngine } from '../core/FakeFiller';
import type { FillOptions, FillResult, FillSnapshot, FillValue } from '../core/types';

export interface UseFakeFillerResult {
  /** Fills every `FFTextInput` (or manually registered field) mounted under the nearest provider. */
  fill: (options?: FillOptions) => FillResult;
  /** Alias for `fill`. */
  regenerate: (options?: FillOptions) => FillResult;
  /** Clears every registered field back to an empty / default value. */
  clear: () => void;
  /** Number of fields currently registered under the nearest provider. */
  fieldCount: () => number;
  /** Replays the latest (or specified) fill snapshot. */
  replay: (snapshotId?: string) => FillResult;
  /** Fill using a named persona. */
  fillPersona: (persona: string, options?: FillOptions) => FillResult;
  /** Fill using a named scenario. */
  fillScenario: (scenario: string, options?: FillOptions) => FillResult;
  /** Brand-new API-safe user every call. */
  newUser: (options?: FillOptions) => FillResult & { user: import('../core/newUser').NewUserIdentity };
  /** Intentional bad data for negative tests. */
  chaos: (options?: FillOptions) => FillResult;
  /** History of recent fills for this session. */
  history: () => FillSnapshot[];
  /** Last generated values (from history). */
  lastValues: () => Record<string, FillValue>;
  /** JSON export of the latest fill. */
  exportJson: () => string;
}

/**
 * Hook exposing fill / clear / replay helpers scoped to the nearest
 * `FakeFillerProvider`. Falls back to the global engine when no provider
 * is present (useful in tests).
 */
export function useFakeFiller(): UseFakeFillerResult {
  const ctx = useFakeFillerContext();

  const fill = useCallback(
    (options?: FillOptions) => {
      if (ctx) return ctx.fillScreen(options);
      return fakeFillerEngine.fillScreen(options);
    },
    [ctx]
  );

  const clear = useCallback(() => {
    if (ctx) ctx.clearFields();
    else fakeFillerEngine.clearFields();
  }, [ctx]);

  const fieldCount = useCallback(() => {
    if (ctx) return ctx.fieldCount();
    return fakeFillerEngine.getRegisteredFieldCount();
  }, [ctx]);

  const replay = useCallback(
    (snapshotId?: string) => {
      if (ctx) return ctx.replay(snapshotId);
      return fakeFillerEngine.replay(snapshotId);
    },
    [ctx]
  );

  const fillPersona = useCallback(
    (persona: string, options?: FillOptions) => fill({ ...options, persona }),
    [fill]
  );

  const fillScenario = useCallback(
    (scenario: string, options?: FillOptions) => fill({ ...options, scenario }),
    [fill]
  );

  const newUser = useCallback(
    (options?: FillOptions) => {
      // Ensure provider fields are synced for newUser path via fill overrides
      if (ctx) {
        const user = fakeFillerEngine.createNewUser(options?.locale);
        const result = ctx.fillScreen({
          ...options,
          mode: 'unique',
          disableRelated: true,
          overrides: { ...user.asOverrides(), ...options?.overrides },
        });
        return { ...result, user };
      }
      return fakeFillerEngine.newUser(options);
    },
    [ctx]
  );

  const chaos = useCallback(
    (options?: FillOptions) => fill({ ...options, chaos: true, mode: 'chaos' }),
    [fill]
  );

  return {
    fill,
    regenerate: fill,
    clear,
    fieldCount,
    replay,
    fillPersona,
    fillScenario,
    newUser,
    chaos,
    history: () => fakeFillerEngine.getHistory(),
    lastValues: () => fakeFillerEngine.exportRegisteredValues(),
    exportJson: () => fakeFillerEngine.exportLastFill(),
  };
}

/** Re-exported for convenience when a component needs the raw engine (rare). */
export { fakeFillerEngine };
