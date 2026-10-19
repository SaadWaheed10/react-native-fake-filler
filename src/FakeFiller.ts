import { fakeFillerEngine } from './core/FakeFiller';
import { detectFieldType } from './core/fieldDetector';
import { forE2E } from './e2e/helpers';
import { isRtlLocale, listLocaleCodes } from './locales/data';
import type { PersonaProfile } from './core/personas';
import type { ScenarioDefinition } from './core/scenarios';
import type {
  FieldSignature,
  FillOptions,
  FillValue,
  Generator,
  LocaleCode,
  PersonaId,
  RegisteredField,
  ScenarioId,
} from './core/types';

export interface RefLikeTarget {
  /** Anything with a `setNativeProps`/`setValue`-like API, or a plain setter function. */
  setValue?: (value: FillValue) => void;
  current?: { setNativeProps?: (props: { text?: string }) => void } | null;
}

function resolveSetter(target: RefLikeTarget | ((v: FillValue) => void)): (v: FillValue) => void {
  if (typeof target === 'function') return target;
  if (target.setValue) return target.setValue;
  if (target.current?.setNativeProps) {
    const current = target.current;
    return (v: FillValue) => current.setNativeProps?.({ text: String(v) });
  }
  return () => {
    // eslint-disable-next-line no-console
    console.warn('FakeFiller: could not resolve a setter for this target, skipping.');
  };
}

/**
 * Static, singleton-style API mirroring the ergonomics of libraries like
 * `Alert` or `Haptics`. Backed by the same engine used by the React hooks —
 * calling `FakeFiller.fillScreen()` fills whatever is currently registered
 * via `FakeFillerProvider` / `FFTextInput` / `useRegisterField`, and
 * `FakeFiller.fill({...})` lets you target arbitrary refs directly without
 * any provider at all (handy in Detox/Maestro/Appium scripts).
 */
export const FakeFiller = {
  /** Fills every field registered under the (app-level) FakeFillerProvider. */
  fillScreen(options?: FillOptions) {
    return fakeFillerEngine.fillScreen(options);
  },

  /**
   * Fills an explicit set of targets, keyed by field type (e.g. "email") or
   * a custom generator name. Each value can be a plain setter function, a
   * `{ setValue }` object, or a ref-like object exposing `setNativeProps`.
   */
  fill(
    targets: Record<
      string,
      | RefLikeTarget
      | ((v: FillValue) => void)
      | { setValue: (v: FillValue) => void; signature?: FieldSignature }
    >,
    options?: FillOptions
  ) {
    const normalized: Record<
      string,
      { setValue: (v: FillValue) => void; signature?: FieldSignature }
    > = {};
    for (const [key, target] of Object.entries(targets)) {
      if (
        typeof target === 'object' &&
        target !== null &&
        'setValue' in target &&
        typeof target.setValue === 'function' &&
        'signature' in target
      ) {
        normalized[key] = target as {
          setValue: (v: FillValue) => void;
          signature?: FieldSignature;
        };
      } else {
        normalized[key] = {
          setValue: resolveSetter(target as RefLikeTarget | ((v: FillValue) => void)),
        };
      }
    }
    return fakeFillerEngine.fill(normalized, options);
  },

  /** Switches to "random" mode: fresh values every call, no uniqueness guarantees. */
  random(options?: Omit<FillOptions, 'mode'>) {
    fakeFillerEngine.setMode('random');
    return fakeFillerEngine.fillScreen(options);
  },

  /** Switches to "seeded" mode and reseeds the PRNG so results are fully reproducible. */
  seed(value: number) {
    fakeFillerEngine.seed(value);
  },

  /** Switches to "fixed" mode, merging the given field-type -> value map into the fixed-value table. */
  fixed(values: Record<string, string>) {
    fakeFillerEngine.fixed(values);
  },

  /** Restores default "unique" mode. */
  unique() {
    fakeFillerEngine.setMode('unique');
  },

  setLocale(locale: LocaleCode) {
    fakeFillerEngine.setLocale(locale);
  },

  getLocale() {
    return fakeFillerEngine.getLocale();
  },

  listLocales() {
    return listLocaleCodes();
  },

  isRtl(locale?: LocaleCode) {
    return isRtlLocale(locale ?? fakeFillerEngine.getLocale());
  },

  /** Registers a custom generator under a name you can reference from `fill()`, `fillScreen()` overrides, or `fakeFillerType`. */
  register(name: string, generator: Generator) {
    fakeFillerEngine.register(name, generator);
  },

  /** Sets custom rules: either fixed string values or generator functions, keyed by field type / custom name. */
  configure(rules: Record<string, string | Generator>) {
    fakeFillerEngine.configure(rules);
  },

  /** Clears fixed-value overrides and resets uniqueness tracking (does not touch registered fields' current values). */
  reset() {
    fakeFillerEngine.reset();
  },

  /** Clears every currently-registered field back to an empty string. */
  clearScreen() {
    fakeFillerEngine.clearFields();
  },

  /** Low-level: registers a field directly with the engine, bypassing the React provider. Mostly for advanced/test-runner integrations. */
  registerField(field: RegisteredField) {
    fakeFillerEngine.registerField(field);
  },

  /** Detects the field type FakeFiller would infer for a given signature, without generating a value. Useful for debugging. */
  detectType(signature: FieldSignature) {
    return detectFieldType(signature);
  },

  /** Generates a single value on demand, e.g. `FakeFiller.generate('email')`. */
  generate(type: string, options?: FillOptions) {
    return fakeFillerEngine.generateValueFor(type, undefined, options);
  },

  // ---- Personas -----------------------------------------------------------

  fillPersona(persona: PersonaId | string, options?: FillOptions) {
    return fakeFillerEngine.fillPersona(persona, options);
  },

  registerPersona(persona: PersonaProfile) {
    fakeFillerEngine.registerPersona(persona);
  },

  listPersonas() {
    return fakeFillerEngine.listPersonas();
  },

  // ---- Scenarios ----------------------------------------------------------

  fillScenario(scenario: ScenarioId | string, options?: FillOptions) {
    return fakeFillerEngine.fillScenario(scenario, options);
  },

  registerScenario(scenario: ScenarioDefinition) {
    fakeFillerEngine.registerScenario(scenario);
  },

  listScenarios() {
    return fakeFillerEngine.listScenarios();
  },

  // ---- History / replay / export ------------------------------------------

  history() {
    return fakeFillerEngine.getHistory();
  },

  clearHistory() {
    fakeFillerEngine.clearHistory();
  },

  replay(snapshotId?: string) {
    return fakeFillerEngine.replay(snapshotId);
  },

  exportJson(snapshotId?: string) {
    return fakeFillerEngine.exportLastFill(snapshotId);
  },

  exportEnv(snapshotId?: string) {
    return fakeFillerEngine.exportLastFillEnv(snapshotId);
  },

  /** Last fill values (from history). */
  lastValues() {
    return fakeFillerEngine.exportRegisteredValues();
  },

  // ---- E2E ----------------------------------------------------------------

  /**
   * Builds a value bag for Detox / Maestro / Appium / Jest without a React tree.
   * @see forE2E
   */
  forE2E: forE2E,
};
