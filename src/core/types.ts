export type FieldKey =
  // Personal
  | 'firstName'
  | 'lastName'
  | 'middleName'
  | 'fullName'
  | 'nickname'
  | 'username'
  | 'initials'
  // Auth
  | 'email'
  | 'password'
  | 'confirmPassword'
  | 'otp'
  | 'pin'
  | 'securityAnswer'
  // Phone
  | 'mobileNumber'
  | 'homeNumber'
  | 'officeNumber'
  | 'countryCode'
  // Address
  | 'street'
  | 'apartment'
  | 'houseNumber'
  | 'building'
  | 'city'
  | 'state'
  | 'province'
  | 'country'
  | 'zipCode'
  | 'postalCode'
  // Business
  | 'company'
  | 'department'
  | 'designation'
  | 'employeeId'
  | 'website'
  // Identity
  | 'dateOfBirth'
  | 'age'
  | 'gender'
  | 'nationality'
  // Banking (test-only values)
  | 'creditCardNumber'
  | 'cardExpiry'
  | 'cvv'
  | 'accountNumber'
  | 'iban'
  | 'bankName'
  // Vehicle
  | 'vehicleNumber'
  | 'licensePlate'
  | 'vehicleManufacturer'
  | 'vehicleModel'
  | 'vin'
  // Education
  | 'school'
  | 'college'
  | 'university'
  | 'degree'
  | 'major'
  // Healthcare
  | 'bloodGroup'
  | 'height'
  | 'weight'
  // Technology
  | 'uuid'
  | 'apiKey'
  | 'refreshToken'
  | 'accessToken'
  // Internet
  | 'domain'
  | 'url'
  | 'ipv4'
  | 'ipv6'
  | 'macAddress'
  // Text
  | 'loremWord'
  | 'sentence'
  | 'paragraph'
  | 'review'
  | 'description'
  | 'comment'
  // Numbers
  | 'integer'
  | 'float'
  | 'percentage'
  | 'currency'
  // Dates
  | 'pastDate'
  | 'futureDate'
  | 'currentDate'
  | 'randomDate'
  // Non-text controls
  | 'boolean'
  | 'checkbox'
  | 'switch'
  | 'picker'
  | 'radio'
  | 'date'
  // Fallback bucket for anything unrecognized but still text-like
  | 'genericText';

export type LocaleCode =
  | 'en-US'
  | 'en-GB'
  | 'fr-FR'
  | 'de-DE'
  | 'ar-SA'
  | 'hi-IN'
  | 'ja-JP'
  | 'es-ES'
  | 'pt-BR'
  | 'zh-CN'
  | 'tr-TR';

export type GenerationMode = 'unique' | 'random' | 'seeded' | 'fixed' | 'chaos';

/** Categories of intentionally bad / edge-case data for negative testing. */
export type ChaosKind =
  | 'invalid-email'
  | 'mismatched-password'
  | 'expired-card'
  | 'underage'
  | 'xss'
  | 'sql-injection'
  | 'emoji-name'
  | 'oversized'
  | 'empty'
  | 'whitespace'
  | 'unicode-rtl'
  | 'mixed';

/** Kind of UI control — text inputs vs toggles/pickers/dates. */
export type ControlKind = 'text' | 'switch' | 'checkbox' | 'picker' | 'radio' | 'date';

/** Values FakeFiller may write into a registered control. */
export type FillValue = string | boolean | number | Date;

/** Named coherent person profile used by `fillPersona`. */
export type PersonaId =
  | 'qa-adult-us'
  | 'qa-adult-uk'
  | 'qa-adult-in'
  | 'qa-adult-sa'
  | 'edge-long-name'
  | 'minimal';

/** Built-in fill scenarios for common flows / negative tests. */
export type ScenarioId =
  | 'signup'
  | 'checkout'
  | 'kyc'
  | 'login'
  | 'invalid-email'
  | 'edge-case-long-name'
  | 'empty-optional';

/** Context passed into every generator function. */
export interface GeneratorContext {
  locale: LocaleCode;
  mode: GenerationMode;
  /** Optional metadata detected from the field itself (min/max age, country, etc.) */
  meta?: FieldMeta;
  /** Shared coherent values for related fields in the current fill pass */
  related?: RelatedValues;
}

export type Generator = (ctx: GeneratorContext) => string;

export interface FieldMeta {
  minAge?: number;
  maxAge?: number;
  countryHint?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  /** Picker / radio option labels the generator may choose from */
  options?: Array<string | number | boolean>;
}

/** Coherent values produced once per fill pass and reused across related fields. */
export interface RelatedValues {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  fullName?: string;
  email?: string;
  username?: string;
  password?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  street?: string;
  creditCardNumber?: string;
  cardExpiry?: string;
  cvv?: string;
  dateOfBirth?: string;
  gender?: string;
  mobileNumber?: string;
}

/** The subset of RN TextInput / accessibility props FakeFiller inspects to classify a field. */
export interface FieldSignature {
  placeholder?: string;
  label?: string;
  accessibilityLabel?: string;
  testID?: string;
  id?: string;
  name?: string;
  /** Free-form key/value metadata a developer can attach, e.g. `fakeFillerType="employeeCode"` */
  fakeFillerType?: string;
  secureTextEntry?: boolean;
  keyboardType?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp | string;
  /** Control kind — defaults to text when omitted */
  controlKind?: ControlKind;
  /** Options for picker/radio controls */
  options?: Array<string | number | boolean>;
}

export interface FillOptions {
  locale?: LocaleCode;
  mode?: GenerationMode;
  seed?: number;
  /** Overrides, keyed by FieldKey or a custom registered generator name */
  overrides?: Record<string, string | Generator>;
  /** Fill using a named coherent persona */
  persona?: PersonaId | string;
  /** Apply a built-in or custom scenario */
  scenario?: ScenarioId | string;
  /** Skip related-field coherence (password↔confirm, address grouping, etc.) */
  disableRelated?: boolean;
  /** Skip validation constraints (maxLength / pattern / minLength) */
  disableValidation?: boolean;
  /**
   * Intentionally bad / edge-case data for negative tests.
   * When true uses 'mixed'; when a ChaosKind, applies that strategy.
   */
  chaos?: boolean | ChaosKind;
  /** Persist this fill to AsyncStorage/MMKV after completion (if available). */
  persist?: boolean;
}

export interface RegisteredField {
  key: string;
  setValue: (value: FillValue) => void;
  signature: FieldSignature;
  /** Explicit field type, when the consumer already knows it (skips detection) */
  type?: FieldKey | string;
  /** Optional getter so history/export can snapshot live values */
  getValue?: () => FillValue;
}

export interface FillSnapshot {
  id: string;
  timestamp: number;
  values: Record<string, FillValue>;
  types: Record<string, string>;
  options?: FillOptions;
  persona?: string;
  scenario?: string;
}

export interface FillResult {
  filled: number;
  skipped: number;
  values: Record<string, FillValue>;
  snapshotId?: string;
}
