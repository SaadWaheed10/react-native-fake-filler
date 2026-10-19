export { FakeFiller } from './FakeFiller';

export { FakeFillerProvider, useRegisterField, useFakeFillerContext } from './react/context';
export type { FakeFillerProviderProps } from './react/context';

export { useFakeFiller } from './react/useFakeFiller';
export type { UseFakeFillerResult } from './react/useFakeFiller';

export { FFTextInput } from './react/FFTextInput';
export type { FFTextInputProps } from './react/FFTextInput';

export { FakeFillerDevToolbar } from './react/DevToolbar';
export type { FakeFillerDevToolbarProps } from './react/DevToolbar';

export {
  FFSwitch,
  FFCheckbox,
  FFPicker,
  FFRadio,
  FFDate,
  useRegisterControl,
} from './react/controls';
export type {
  FFSwitchProps,
  FFCheckboxProps,
  FFPickerProps,
  FFRadioProps,
  FFDateProps,
} from './react/controls';

export { useShakeToFill } from './react/useShakeToFill';
export type { UseShakeToFillOptions } from './react/useShakeToFill';

export {
  withFakeFiller,
  createPaperTextInputWrapper,
  createNativeBaseInputWrapper,
  createTamaguiInputWrapper,
  createGlueStackInputWrapper,
} from './react/wrappers';
export type { WithFakeFillerOptions } from './react/wrappers';

export { forE2E } from './e2e/helpers';
export type { E2EBundle } from './e2e/helpers';

export { getPersona, listPersonas, registerPersona } from './core/personas';
export type { PersonaProfile } from './core/personas';

export { getScenario, listScenarios, registerScenario } from './core/scenarios';
export type { ScenarioDefinition } from './core/scenarios';

export { isRtlLocale, listLocaleCodes, getLocale } from './locales/data';

export type {
  FieldKey,
  LocaleCode,
  GenerationMode,
  Generator,
  GeneratorContext,
  FieldMeta,
  FieldSignature,
  FillOptions,
  RegisteredField,
  FillValue,
  FillResult,
  FillSnapshot,
  ControlKind,
  PersonaId,
  ScenarioId,
  RelatedValues,
} from './core/types';

export { detectFieldType } from './core/fieldDetector';
export { FakeFillerEngine, fakeFillerEngine } from './core/FakeFiller';
export { applyValidation } from './core/validation';
export { buildRelatedValues, relatedValueFor } from './core/related';
