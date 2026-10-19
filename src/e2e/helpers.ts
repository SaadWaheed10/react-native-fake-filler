import { PRNG } from '../core/prng';
import { fakeFillerEngine } from '../core/FakeFiller';
import { getPersona } from '../core/personas';
import { getScenario, resolveScenarioOptions } from '../core/scenarios';
import { buildRelatedValues } from '../core/related';
import type {
  FieldKey,
  FillOptions,
  FillValue,
  LocaleCode,
  PersonaId,
  ScenarioId,
} from '../core/types';

export interface E2EBundle {
  /** Flat string map — safe for Maestro env / Appium sendKeys / Detox typeText */
  values: Record<string, string>;
  /** Typed values before stringification */
  raw: Record<string, FillValue>;
  seed?: number;
  locale: LocaleCode;
  persona?: string;
  scenario?: string;
  /** Maestro-friendly YAML snippet assigning env vars */
  toMaestroEnv: () => string;
  /** Detox helper snippet for a given testID */
  detoxTypeText: (testID: string, field?: string) => string;
}

const DEFAULT_FIELDS: FieldKey[] = [
  'firstName',
  'lastName',
  'fullName',
  'email',
  'username',
  'password',
  'confirmPassword',
  'mobileNumber',
  'street',
  'city',
  'state',
  'zipCode',
  'country',
  'dateOfBirth',
  'creditCardNumber',
  'cardExpiry',
  'cvv',
];

/**
 * Builds a deterministic bag of fake values for E2E runners that cannot
 * mount a React tree (Detox, Maestro, Appium, plain Jest setup).
 *
 * @example
 * ```ts
 * const data = FakeFiller.forE2E({ seed: 42, scenario: 'signup' });
 * await element(by.id('email')).typeText(data.values.email);
 * ```
 */
export function forE2E(
  options: FillOptions & {
    fields?: string[];
  } = {}
): E2EBundle {
  let resolved: FillOptions = { ...options };
  if (options.scenario) {
    resolved = resolveScenarioOptions(options.scenario, options);
  }

  if (resolved.seed !== undefined) {
    fakeFillerEngine.seed(resolved.seed);
  }

  const persona = resolved.persona ? getPersona(resolved.persona) : undefined;
  const locale = (resolved.locale ?? persona?.locale ?? fakeFillerEngine.getLocale()) as LocaleCode;

  if (persona?.locale) {
    fakeFillerEngine.setLocale(persona.locale);
  } else if (resolved.locale) {
    fakeFillerEngine.setLocale(resolved.locale);
  }

  const prng = new PRNG(resolved.seed);
  const related = resolved.disableRelated ? undefined : buildRelatedValues(prng, locale);

  const fields = options.fields ?? DEFAULT_FIELDS;
  const raw: Record<string, FillValue> = {};

  for (const field of fields) {
    if (resolved.overrides?.[field] !== undefined) {
      const o = resolved.overrides[field];
      raw[field] = typeof o === 'function' ? o({ locale, mode: resolved.mode ?? 'unique' }) : o;
      continue;
    }
    if (persona?.values[field] !== undefined) {
      raw[field] = persona.values[field] as string;
      continue;
    }
    raw[field] = fakeFillerEngine.generateValueFor(field, undefined, resolved, related);
  }

  if (raw.password !== undefined && raw.confirmPassword !== undefined) {
    raw.confirmPassword = raw.password;
  }

  const values: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    values[k] = v instanceof Date ? v.toISOString().slice(0, 10) : String(v);
  }

  const scenarioMeta = options.scenario ? getScenario(options.scenario) : undefined;

  return {
    values,
    raw,
    seed: resolved.seed,
    locale,
    persona: resolved.persona as string | undefined,
    scenario: (resolved.scenario ?? scenarioMeta?.id) as string | undefined,
    toMaestroEnv() {
      return Object.entries(values)
        .map(([k, v]) => `    ${k}: "${v.replace(/"/g, '\\"')}"`)
        .join('\n');
    },
    detoxTypeText(testID: string, field?: string) {
      const key = field ?? testID;
      const text = values[key] ?? '';
      return `await element(by.id('${testID}')).typeText('${text.replace(/'/g, "\\'")}');`;
    },
  };
}

export type { PersonaId, ScenarioId };
