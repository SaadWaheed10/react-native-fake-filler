import { PRNG } from './prng';
import { UniquenessTracker } from './uniqueness';
import { buildGeneratorRegistry } from '../generators';
import { detectFieldType } from './fieldDetector';
import type {
  FieldKey,
  FieldSignature,
  FillOptions,
  GenerationMode,
  Generator,
  LocaleCode,
  RegisteredField,
} from './types';

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

  constructor() {
    this.prng = new PRNG();
    this.registry = buildGeneratorRegistry(this.prng, this.uniq);
  }

  // ---- Configuration -----------------------------------------------------

  setLocale(locale: LocaleCode): void {
    this.locale = locale;
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

  // ---- Value generation ---------------------------------------------------

  /** Resolves a single value for a given field type / signature. */
  generateValueFor(type: string, signature?: FieldSignature, options?: FillOptions): string {
    const mode = options?.mode ?? this.mode;
    const locale = options?.locale ?? this.locale;

    if (mode === 'fixed' && this.fixedValues[type] !== undefined) {
      return this.fixedValues[type] as string;
    }
    if (options?.overrides?.[type] !== undefined) {
      const override = options.overrides[type];
      return typeof override === 'function'
        ? override({ locale, mode })
        : override;
    }
    if (this.customGenerators.has(type)) {
      return (this.customGenerators.get(type) as Generator)({ locale, mode });
    }
    const key = type as FieldKey;
    const gen = this.registry[key] ?? this.registry.genericText;
    return gen({ locale, mode, meta: signature ? undefined : undefined });
  }

  /** Fills every field currently registered (i.e. mounted + wired up). */
  fillScreen(options?: FillOptions): { filled: number; skipped: number } {
    if (options?.seed !== undefined) this.seed(options.seed);
    let filled = 0;
    let skipped = 0;
    for (const field of this.fieldRegistry.values()) {
      const type = field.type ?? detectFieldType(field.signature);
      if (!type) {
        skipped++;
        continue;
      }
      const value = this.generateValueFor(type, field.signature, options);
      field.setValue(value);
      filled++;
    }
    return { filled, skipped };
  }

  /** Fills an explicit map of { fieldName: setter } style targets, keyed by FieldKey. */
  fill(
    targets: Record<string, { setValue: (v: string) => void; signature?: FieldSignature }>,
    options?: FillOptions
  ): { filled: number; skipped: number } {
    if (options?.seed !== undefined) this.seed(options.seed);
    let filled = 0;
    let skipped = 0;
    for (const [key, target] of Object.entries(targets)) {
      const type = target.signature ? detectFieldType(target.signature) ?? key : key;
      const value = this.generateValueFor(type, target.signature, options);
      if (value === undefined) {
        skipped++;
        continue;
      }
      target.setValue(value);
      filled++;
    }
    return { filled, skipped };
  }

  clearFields(): void {
    for (const field of this.fieldRegistry.values()) {
      field.setValue('');
    }
  }

  getRegisteredFieldCount(): number {
    return this.fieldRegistry.size;
  }

  /** Snapshot of the last-generated values, useful for the dev toolbar's "copy"/"export" actions. */
  exportRegisteredValues(): Record<string, string> {
    // Note: engine doesn't cache values by default (fields own their state);
    // this reads current values back out via a caller-supplied getter map
    // in the React layer instead. Kept here for API symmetry / future use.
    return {};
  }
}

/** Singleton instance used by the top-level `FakeFiller` API and hooks. */
export const fakeFillerEngine = new FakeFillerEngine();
