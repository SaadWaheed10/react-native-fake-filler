export { FakeFiller } from './FakeFiller';

export { FakeFillerProvider, useRegisterField, useFakeFillerContext } from './react/context';
export type { FakeFillerProviderProps } from './react/context';

export { useFakeFiller } from './react/useFakeFiller';
export type { UseFakeFillerResult } from './react/useFakeFiller';

export { useFillFlow } from './react/useFillFlow';

export { FFTextInput } from './react/FFTextInput';
export type { FFTextInputProps } from './react/FFTextInput';

export { FakeFillerDevToolbar } from './react/DevToolbar';
export type { FakeFillerDevToolbarProps } from './react/DevToolbar';

export { CoverageOverlay } from './react/CoverageOverlay';
export type { CoverageOverlayProps } from './react/CoverageOverlay';

export { ShareFill } from './react/ShareFill';
export type { ShareFillProps } from './react/ShareFill';

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

export { forScreenshot } from './core/screenshot';
export type { ScreenshotFixture } from './core/screenshot';

export { runFillFlow } from './core/wizard';
export type { FlowStep, FillFlowOptions } from './core/wizard';

export { createNewUser } from './core/newUser';
export type { NewUserIdentity } from './core/newUser';

export { createFakeFile, createFakeFiles, materializeFakeFile } from './core/files';
export type { FakeFile, FakeFileKind } from './core/files';

export { expectedRequestBody, matchRequestBody } from './core/network';
export type { ExpectedRequestBody } from './core/network';

export {
  persistHistory,
  loadPersistedHistory,
  restoreLastFill,
  clearPersistedHistory,
  setPersistStorage,
} from './core/persist';

export { syncFromUrl, applyRemotePack } from './core/remoteSync';
export type { RemotePack, SyncResult } from './core/remoteSync';

export { buildCoverageReport } from './core/coverage';
export type { CoverageReport, FieldCoverageEntry } from './core/coverage';

export {
  generateOtp,
  stubBiometric,
  promptBiometric,
  buildDeepLink,
  openDeepLink,
  authFixture,
} from './core/authStubs';
export type { BiometricResult, DeepLinkOptions, OtpOptions } from './core/authStubs';

export {
  fillReactHookForm,
  fillFormik,
  fillFinalForm,
} from './adapters';
export type {
  RHFLike,
  FillRHFOptions,
  FormikLike,
  FillFormikOptions,
  FinalFormLike,
  FillFinalFormOptions,
} from './adapters';

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
  ChaosKind,
} from './core/types';

export { detectFieldType } from './core/fieldDetector';
export { FakeFillerEngine, fakeFillerEngine } from './core/FakeFiller';
export { applyValidation } from './core/validation';
export { buildRelatedValues, relatedValueFor } from './core/related';
export { chaosValueFor } from './core/chaos';
