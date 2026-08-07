export { FakeFiller } from './FakeFiller';

export { FakeFillerProvider, useRegisterField, useFakeFillerContext } from './react/context';
export type { FakeFillerProviderProps } from './react/context';

export { useFakeFiller } from './react/useFakeFiller';
export type { UseFakeFillerResult } from './react/useFakeFiller';

export { FFTextInput } from './react/FFTextInput';
export type { FFTextInputProps } from './react/FFTextInput';

export { FakeFillerDevToolbar } from './react/DevToolbar';
export type { FakeFillerDevToolbarProps } from './react/DevToolbar';

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
} from './core/types';

export { detectFieldType } from './core/fieldDetector';
export { FakeFillerEngine, fakeFillerEngine } from './core/FakeFiller';
