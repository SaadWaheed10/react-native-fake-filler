import type { FieldKey, FieldSignature } from './types';

/**
 * Ordered list of (FieldKey, keyword[]) pairs. Order matters: more specific
 * patterns are listed before more general ones (e.g. "confirmPassword"
 * before "password") since detection stops at the first match.
 */
const RULES: Array<[FieldKey, string[]]> = [
  // Auth (specific before generic)
  ['confirmPassword', ['confirm password', 'confirmpassword', 'confirm pwd', 're-enter password', 'retype password']],
  ['password', ['password', 'pwd', 'passcode']],
  ['otp', ['otp', 'one time password', 'verification code', 'one-time code']],
  ['pin', ['pin code', 'pin']],
  ['securityAnswer', ['security answer', 'secret answer']],
  ['email', ['email', 'e-mail']],

  // Personal
  ['fullName', ['full name', 'fullname', 'your name']],
  ['firstName', ['first name', 'firstname', 'given name', 'fname']],
  ['middleName', ['middle name', 'middlename']],
  ['lastName', ['last name', 'lastname', 'surname', 'family name', 'lname']],
  ['nickname', ['nickname', 'nick name']],
  ['username', ['username', 'user name', 'handle', 'login id']],
  ['initials', ['initials']],

  // Phone
  ['countryCode', ['country code', 'dial code', 'isd code']],
  ['mobileNumber', ['mobile', 'cell phone', 'cellphone', 'mobile number', 'phone number', 'phone']],
  ['homeNumber', ['home number', 'home phone', 'landline']],
  ['officeNumber', ['office number', 'work phone', 'business phone']],

  // Address
  ['apartment', ['apartment', 'apt', 'unit number', 'suite']],
  ['houseNumber', ['house number', 'house no']],
  ['building', ['building', 'building name']],
  ['street', ['street', 'address line', 'address 1', 'address1', 'street address']],
  ['city', ['city', 'town']],
  ['state', ['state']],
  ['province', ['province']],
  ['zipCode', ['zip code', 'zipcode', 'zip']],
  ['postalCode', ['postal code', 'postcode']],
  ['country', ['country']],

  // Business
  ['employeeId', ['employee id', 'emp id', 'staff id']],
  ['designation', ['designation', 'job title', 'title']],
  ['department', ['department', 'dept']],
  ['company', ['company', 'organization', 'organisation', 'employer']],
  ['website', ['website', 'web site', 'homepage url']],

  // Identity
  ['dateOfBirth', ['date of birth', 'dob', 'birth date', 'birthdate']],
  ['age', ['age']],
  ['gender', ['gender', 'sex']],
  ['nationality', ['nationality']],

  // Banking
  ['creditCardNumber', ['credit card', 'card number', 'debit card']],
  ['cardExpiry', ['expiry', 'expiration date', 'exp date', 'mm/yy']],
  ['cvv', ['cvv', 'cvc', 'security code']],
  ['iban', ['iban']],
  ['accountNumber', ['account number', 'acc number', 'account no']],
  ['bankName', ['bank name', 'bank']],

  // Vehicle
  ['vin', ['vin', 'vehicle identification number']],
  ['licensePlate', ['license plate', 'number plate', 'plate number']],
  ['vehicleNumber', ['vehicle number', 'vehicle no']],
  ['vehicleManufacturer', ['vehicle make', 'manufacturer', 'vehicle brand']],
  ['vehicleModel', ['vehicle model', 'car model']],

  // Education
  ['university', ['university']],
  ['college', ['college']],
  ['school', ['school']],
  ['degree', ['degree', 'qualification']],
  ['major', ['major', 'field of study']],

  // Healthcare
  ['bloodGroup', ['blood group', 'blood type']],
  ['height', ['height']],
  ['weight', ['weight']],

  // Technology
  ['uuid', ['uuid', 'guid']],
  ['apiKey', ['api key', 'apikey']],
  ['refreshToken', ['refresh token']],
  ['accessToken', ['access token', 'bearer token']],

  // Internet
  ['ipv4', ['ipv4', 'ip address']],
  ['ipv6', ['ipv6']],
  ['macAddress', ['mac address']],
  ['domain', ['domain']],
  ['url', ['url', 'link']],

  // Text
  ['review', ['review']],
  ['comment', ['comment']],
  ['description', ['description', 'bio', 'about you', 'about']],
  ['paragraph', ['paragraph', 'message', 'notes']],
  ['sentence', ['remarks']],

  // Numbers
  ['percentage', ['percentage', 'percent']],
  ['currency', ['price', 'amount', 'cost', 'salary', 'budget']],
  ['float', ['decimal']],
  ['integer', ['quantity', 'count', 'number']],

  // Dates (generic — after DOB so DOB wins)
  ['futureDate', ['expiry date', 'due date', 'end date']],
  ['pastDate', ['start date', 'issue date']],
  ['currentDate', ['today', 'current date']],
  ['randomDate', ['date']],

  // Non-text controls (fallback keywords)
  ['switch', ['switch', 'toggle']],
  ['checkbox', ['checkbox', 'agree to', 'terms and', 'accept terms', 'i agree']],
  ['picker', ['picker', 'dropdown', 'select option']],
  ['radio', ['radio']],
];

function normalize(value: string | undefined): string {
  return (value ?? '').toLowerCase().trim();
}

/**
 * Classifies a field based on its placeholder/label/testID/etc. Returns
 * `undefined` when nothing matches, so callers can decide whether to skip
 * the field or fall back to `genericText`.
 */
export function detectFieldType(signature: FieldSignature): FieldKey | undefined {
  if (signature.fakeFillerType) {
    // Explicit developer-provided type always wins, cast through since it
    // may reference a custom-registered generator name rather than a
    // built-in FieldKey.
    return signature.fakeFillerType as FieldKey;
  }

  const haystacks = [
    normalize(signature.label),
    normalize(signature.placeholder),
    normalize(signature.accessibilityLabel),
    normalize(signature.name),
    normalize(signature.testID),
    normalize(signature.id),
  ].filter(Boolean);

  if (haystacks.length === 0) {
    if (signature.secureTextEntry) return 'password';
    return undefined;
  }

  for (const [key, keywords] of RULES) {
    for (const haystack of haystacks) {
      for (const kw of keywords) {
        if (haystack.includes(kw)) {
          return key;
        }
      }
    }
  }

  if (signature.secureTextEntry) return 'password';
  if (signature.keyboardType === 'email-address') return 'email';
  if (signature.keyboardType === 'phone-pad' || signature.keyboardType === 'number-pad') {
    return 'mobileNumber';
  }

  return undefined;
}
