import { PRNG } from './prng';
import { UniquenessTracker } from './uniqueness';
import { buildGeneratorRegistry } from '../generators';
import { detectFieldType } from './fieldDetector';
import { buildRelatedValues, relatedValueFor } from './related';
import { applyValidation, metaFromSignature } from './validation';
import { FillHistory } from './history';
import { getPersona, registerPersona, listPersonas } from './personas';
import { getScenario, registerScenario, listScenarios, resolveScenarioOptions } from './scenarios';
import { detectControlKind, generateControlValue, isNonTextKind } from './controls';
import type {
  FieldKey,
  FieldSignature,
  FillOptions,
  FillResult,
  FillSnapshot,
  FillValue,
  GenerationMode,
  Generator,
  LocaleCode,
  PersonaId,
  RegisteredField,
  RelatedValues,
  ScenarioId,
} from './types';
import type { PersonaProfile } from './personas';
import type { ScenarioDefinition } from './scenarios';

const DEFAULT_LOCALE: LocaleCode = 'en-US';

/**
 * The core engine. Framework-agnostic: it knows nothing about React or
 * React Native components directly. It works against `RegisteredField`
 * objects (a value setter + a signature to classify), which the React
 * integration layer (`FakeFillerProvider` / `useFakeFiller`) supplies from
 * whatever fields are currently mounted on screen.
 */
export class FakeFillerEngine {
  private prng: PRNG;
  private uniq = new UniquenessTracker();
  private registry: Record<FieldKey, Generator>;
  private customGenerators = new Map<string, Generator>();
  private locale: LocaleCode = DEFAULT_LOCALE;
  private mode: GenerationMode = 'unique';
  private fixedValues: Record<string, string> = {};
  private fieldRegistry = new Map<string, RegisteredField>();
  private history = new FillHistory();
  private lastRelated: RelatedValues | undefined;

  constructor() {
    this.prng = new PRNG();
    this.registry = buildGeneratorRegistry(this.prng, this.uniq);
  }

  // ---- Configuration -----------------------------------------------------

  setLocale(locale: LocaleCode): void {
    this.locale = locale;
  }

  getLocale(): LocaleCode {
    return this.locale;
  }

  seed(value: number): void {
    this.mode = 'seeded';
    this.prng.reseed(value);
    this.uniq.reset();
  }

  setMode(mode: GenerationMode): void {
    this.mode = mode;
  }

  fixed(values: Record<string, string>): void {
    this.mode = 'fixed';
    this.fixedValues = { ...this.fixedValues, ...values };
  }

  register(name: string, generator: Generator): void {
    this.customGenerators.set(name, generator);
  }

  configure(rules: Record<string, string | Generator>): void {
    for (const [key, value] of Object.entries(rules)) {
      if (typeof value === 'function') {
        this.customGenerators.set(key, value);
      } else {
        this.fixedValues[key] = value;
      }
    }
  }

  reset(): void {
    this.uniq.reset();
    this.fixedValues = {};
    this.lastRelated = undefined;
  }

  // ---- Personas / scenarios / history ------------------------------------

  registerPersona(persona: PersonaProfile): void {
    registerPersona(persona);
  }

  listPersonas(): PersonaProfile[] {
    return listPersonas();
  }

  registerScenario(scenario: ScenarioDefinition): void {
    registerScenario(scenario);
  }

  listScenarios(): ScenarioDefinition[] {
    return listScenarios();
  }

  getHistory(): FillSnapshot[] {
    return this.history.list();
  }

  clearHistory(): void {
    this.history.clear();
  }

  exportLastFill(id?: string): string {
    return this.history.exportJson(id);
  }

  exportLastFillEnv(id?: string): Record<string, string> {
    return this.history.exportEnv(id);
  }

  // ---- Field registry (used by the React integration layer) -------------

  registerField(field: RegisteredField): void {
    this.fieldRegistry.set(field.key, field);
  }

  unregisterField(key: string): void {
    this.fieldRegistry.delete(key);
  }

  clearFieldRegistry(): void {
    this.fieldRegistry.clear();
  }

  getFields(): RegisteredField[] {
    return [...this.fieldRegistry.values()];
  }

  // ---- Value generation ---------------------------------------------------

  /** Resolves a single value for a given field type / signature. */
  generateValueFor(
    type: string,
    signature?: FieldSignature,
    options?: FillOptions,
    related?: RelatedValues
  ): FillValue {
    const mode = options?.mode ?? this.mode;
    const locale = options?.locale ?? this.locale;
    const meta = metaFromSignature(signature);
    const ctxRelated = related ?? this.lastRelated;

    if (mode === 'fixed' && this.fixedValues[type] !== undefined) {
      return this.maybeValidate(this.fixedValues[type] as string, signature, meta, options);
    }
    if (options?.overrides?.[type] !== undefined) {
      const override = options.overrides[type];
      const raw =
        typeof override === 'function' ? override({ locale, mode, meta, related: ctxRelated }) : override;
      return this.maybeValidate(raw, signature, meta, options);
    }
    if (this.customGenerators.has(type)) {
      const raw = (this.customGenerators.get(type) as Generator)({
        locale,
        mode,
        meta,
        related: ctxRelated,
      });
      return this.maybeValidate(raw, signature, meta, options);
    }

    // Non-text controls
    const kind = signature ? detectControlKind(signature) : 'text';
    if (isNonTextKind(kind) || type === 'boolean' || type === 'switch' || type === 'checkbox' || type === 'picker' || type === 'radio' || type === 'date') {
      const controlKind = isNonTextKind(kind) ? kind : (type as typeof kind);
      const raw = generateControlValue(controlKind, this.prng, signature, {
        locale,
        mode,
        meta,
        related: ctxRelated,
      });
      return raw;
    }

    // Related-field coherence
    if (!options?.disableRelated && ctxRelated) {
      const relatedVal = relatedValueFor(type, ctxRelated);
      if (relatedVal !== undefined) {
        return this.maybeValidate(relatedVal, signature, meta, options);
      }
    }

    const key = type as FieldKey;
    const gen = this.registry[key] ?? this.registry.genericText;
    const raw = gen({ locale, mode, meta, related: ctxRelated });
    return this.maybeValidate(raw, signature, meta, options);
  }

  private maybeValidate(
    value: FillValue,
    signature: FieldSignature | undefined,
    meta: ReturnType<typeof metaFromSignature>,
    options?: FillOptions
  ): FillValue {
    if (options?.disableValidation) return value;
    return applyValidation(value, signature, meta);
  }

  private resolveOptions(options?: FillOptions): FillOptions {
    let resolved: FillOptions = { ...options };

    if (options?.scenario) {
      resolved = resolveScenarioOptions(options.scenario, options);
    }

    if (resolved.persona) {
      const persona = getPersona(resolved.persona);
      if (persona) {
        resolved = {
          ...resolved,
          locale: resolved.locale ?? persona.locale,
          overrides: {
            ...persona.values,
            ...resolved.overrides,
          },
        };
      }
    }

    return resolved;
  }

  /** Fills every field currently registered (i.e. mounted + wired up). */
  fillScreen(options?: FillOptions): FillResult {
    const resolved = this.resolveOptions(options);
    if (resolved.seed !== undefined) this.seed(resolved.seed);

    const locale = resolved.locale ?? this.locale;
    const related = resolved.disableRelated ? undefined : buildRelatedValues(this.prng, locale);
    this.lastRelated = related;

    let filled = 0;
    let skipped = 0;
    const values: Record<string, FillValue> = {};
    const types: Record<string, string> = {};

    for (const field of this.fieldRegistry.values()) {
      const kind = detectControlKind(field.signature);
      let type = field.type ?? detectFieldType(field.signature);

      if (!type && isNonTextKind(kind)) {
        type = kind;
      }

      if (!type) {
        skipped++;
        continue;
      }

      const value = this.generateValueFor(type, field.signature, resolved, related);
      field.setValue(value);
      values[field.key] = value;
      types[field.key] = type;
      filled++;
    }

    const snapshot = this.history.push(values, types, resolved);
    return { filled, skipped, values, snapshotId: snapshot.id };
  }

  /** Fills an explicit map of { fieldName: setter } style targets, keyed by FieldKey. */
  fill(
    targets: Record<string, { setValue: (v: FillValue) => void; signature?: FieldSignature }>,
    options?: FillOptions
  ): FillResult {
    const resolved = this.resolveOptions(options);
    if (resolved.seed !== undefined) this.seed(resolved.seed);

    const locale = resolved.locale ?? this.locale;
    const related = resolved.disableRelated ? undefined : buildRelatedValues(this.prng, locale);
    this.lastRelated = related;

    let filled = 0;
    let skipped = 0;
    const values: Record<string, FillValue> = {};
    const types: Record<string, string> = {};

    for (const [key, target] of Object.entries(targets)) {
      const type = target.signature ? detectFieldType(target.signature) ?? key : key;
      const value = this.generateValueFor(type, target.signature, resolved, related);
      if (value === undefined) {
        skipped++;
        continue;
      }
      target.setValue(value);
      values[key] = value;
      types[key] = type;
      filled++;
    }

    const snapshot = this.history.push(values, types, resolved);
    return { filled, skipped, values, snapshotId: snapshot.id };
  }

  /** Fills using a named persona (and optional extra options). */
  fillPersona(persona: PersonaId | string, options?: FillOptions): FillResult {
    return this.fillScreen({ ...options, persona });
  }

  /** Fills using a named scenario. */
  fillScenario(scenario: ScenarioId | string, options?: FillOptions): FillResult {
    return this.fillScreen({ ...options, scenario });
  }

  /** Replays a previous fill snapshot onto currently registered fields. */
  replay(snapshotId?: string): FillResult {
    const snap = snapshotId ? this.history.get(snapshotId) : this.history.latest();
    if (!snap) return { filled: 0, skipped: 0, values: {} };

    let filled = 0;
    let skipped = 0;
    const values: Record<string, FillValue> = {};

    for (const field of this.fieldRegistry.values()) {
      const value = snap.values[field.key];
      if (value === undefined) {
        // Try matching by detected type
        const type = field.type ?? detectFieldType(field.signature);
        const byType = type
          ? Object.entries(snap.types).find(([, t]) => t === type)?.[0]
          : undefined;
        const fallback = byType ? snap.values[byType] : undefined;
        if (fallback === undefined) {
          skipped++;
          continue;
        }
        field.setValue(fallback);
        values[field.key] = fallback;
        filled++;
        continue;
      }
      field.setValue(value);
      values[field.key] = value;
      filled++;
    }

    return { filled, skipped, values, snapshotId: snap.id };
  }

  clearFields(): void {
    for (const field of this.fieldRegistry.values()) {
      const kind = detectControlKind(field.signature);
      if (kind === 'switch' || kind === 'checkbox') {
        field.setValue(false);
      } else if (kind === 'date') {
        field.setValue(new Date());
      } else {
        field.setValue('');
      }
    }
  }

  getRegisteredFieldCount(): number {
    return this.fieldRegistry.size;
  }

  /** Snapshot of the last-generated values from history. */
  exportRegisteredValues(): Record<string, FillValue> {
    return this.history.latest()?.values ?? {};
  }
}

/** Singleton instance used by the top-level `FakeFiller` API and hooks. */
export const fakeFillerEngine = new FakeFillerEngine();
