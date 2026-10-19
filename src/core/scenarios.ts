import type { FillOptions, ScenarioId } from './types';
import type { PersonaId } from './types';

export interface ScenarioDefinition {
  id: ScenarioId | string;
  label: string;
  description: string;
  /** Default fill options this scenario applies */
  options: FillOptions;
  /** Optional persona to load */
  persona?: PersonaId | string;
  /** Extra fixed overrides layered on top of persona/generators */
  overrides?: Record<string, string>;
}

const SCENARIOS: Record<string, ScenarioDefinition> = {
  signup: {
    id: 'signup',
    label: 'Signup (happy path)',
    description: 'Coherent name, email, matching passwords, phone.',
    options: { mode: 'unique' },
    persona: 'qa-adult-us',
  },
  login: {
    id: 'login',
    label: 'Login',
    description: 'Email + password only.',
    options: { mode: 'fixed' },
    overrides: {
      email: 'jordan.lee.qa@example.com',
      password: 'MyStorm!42',
      username: 'jordanlee42',
    },
  },
  checkout: {
    id: 'checkout',
    label: 'Checkout',
    description: 'Shipping address + test card details.',
    options: { mode: 'unique' },
    persona: 'qa-adult-us',
    overrides: {
      creditCardNumber: '4111111111111111',
      cardExpiry: '12/28',
      cvv: '123',
    },
  },
  kyc: {
    id: 'kyc',
    label: 'KYC / identity',
    description: 'Identity + address fields for verification flows.',
    options: { mode: 'unique' },
    persona: 'qa-adult-in',
    overrides: {
      nationality: 'Indian',
      bloodGroup: 'O+',
    },
  },
  'invalid-email': {
    id: 'invalid-email',
    label: 'Negative: invalid email',
    description: 'Intentionally broken email for validation UI tests.',
    options: { mode: 'fixed', disableValidation: true },
    overrides: {
      email: 'not-an-email',
      firstName: 'Test',
      lastName: 'Invalid',
      password: 'MyStorm!42',
      confirmPassword: 'MyStorm!42',
    },
  },
  'edge-case-long-name': {
    id: 'edge-case-long-name',
    label: 'Edge: long name',
    description: 'Stress-tests truncation and layout with long strings.',
    options: { mode: 'fixed' },
    persona: 'edge-long-name',
  },
  'empty-optional': {
    id: 'empty-optional',
    label: 'Empty optional fields',
    description: 'Fills required-looking auth fields; leaves description/comment empty.',
    options: { mode: 'fixed' },
    overrides: {
      firstName: 'Sam',
      lastName: 'Rivera',
      email: 'sam.rivera@example.com',
      password: 'MyComet!33',
      confirmPassword: 'MyComet!33',
      description: '',
      comment: '',
      middleName: '',
    },
  },
};

const customScenarios = new Map<string, ScenarioDefinition>();

export function getScenario(id: ScenarioId | string): ScenarioDefinition | undefined {
  return customScenarios.get(id) ?? SCENARIOS[id];
}

export function listScenarios(): ScenarioDefinition[] {
  return [...Object.values(SCENARIOS), ...customScenarios.values()];
}

export function registerScenario(scenario: ScenarioDefinition): void {
  customScenarios.set(scenario.id, scenario);
}

/** Merges scenario defaults with caller-supplied FillOptions (caller wins). */
export function resolveScenarioOptions(
  scenarioId: ScenarioId | string,
  options?: FillOptions
): FillOptions {
  const scenario = getScenario(scenarioId);
  if (!scenario) return { ...options, scenario: scenarioId };

  const personaValues = scenario.persona
    ? { persona: scenario.persona as string }
    : {};

  return {
    ...scenario.options,
    ...personaValues,
    ...options,
    scenario: scenarioId,
    overrides: {
      ...scenario.overrides,
      ...options?.overrides,
    },
  };
}
