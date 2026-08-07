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
  // Fallback bucket for anything unrecognized but still text-like
  | 'genericText';

export type LocaleCode =
  | 'en-US'
  | 'en-GB'
  | 'fr-FR'
  | 'de-DE'
  | 'ar-SA'
  | 'hi-IN'
  | 'ja-JP';

export type GenerationMode = 'unique' | 'random' | 'seeded' | 'fixed';

/** Context passed into every generator function. */
export interface GeneratorContext {
  locale: LocaleCode;
  mode: GenerationMode;
  /** Optional metadata detected from the field itself (min/max age, country, etc.) */
  meta?: FieldMeta;
}

export type Generator = (ctx: GeneratorContext) => string;

export interface FieldMeta {
  minAge?: number;
  maxAge?: number;
  countryHint?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
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
}

export interface FillOptions {
  locale?: LocaleCode;
  mode?: GenerationMode;
  seed?: number;
  /** Overrides, keyed by FieldKey or a custom registered generator name */
  overrides?: Record<string, string | Generator>;
}

export interface RegisteredField {
  key: string;
  setValue: (value: string) => void;
  signature: FieldSignature;
  /** Explicit field type, when the consumer already knows it (skips detection) */
  type?: FieldKey | string;
}
