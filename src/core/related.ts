import { getLocale } from '../locales/data';
import type { PRNG } from './prng';
import type { LocaleCode, RelatedValues } from './types';

/**
 * Builds a coherent set of related values once per fill pass so that
 * password ↔ confirmPassword, first+last → email/fullName, and
 * city/state/zip stay consistent instead of looking randomly assembled.
 */
export function buildRelatedValues(prng: PRNG, locale: LocaleCode): RelatedValues {
  const data = getLocale(locale);
  const gender = prng.bool() ? 'male' : 'female';
  const firstName = prng.pick(gender === 'male' ? data.firstNamesMale : data.firstNamesFemale);
  const lastName = prng.pick(data.lastNames);
  const middleName = prng.pick(gender === 'male' ? data.firstNamesMale : data.firstNamesFemale);
  const fullName = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${prng.digits(4)}@example.com`;
  const username = `${firstName.toLowerCase()}${prng.digits(4)}`;
  const password = `My${prng.pick(['Storm', 'Falcon', 'Nebula', 'Quartz', 'Ember'])}!${prng.int(10, 99)}`;

  const city = prng.pick(data.cities);
  const state = prng.pick(data.states);
  const street = `${prng.int(1, 9999)} ${prng.pick(data.streets)}`;
  const zipCode = renderPattern(prng, data.postalCodeFormat());
  const country = data.countryName;
  const mobileNumber = renderPattern(prng, data.phoneFormat);

  const creditCardNumber = luhnCard(prng);
  const month = String(prng.int(1, 12)).padStart(2, '0');
  const year = String((new Date().getFullYear() % 100) + prng.int(1, 5)).padStart(2, '0');
  const cardExpiry = `${month}/${year}`;
  const cvv = prng.digits(3);

  const age = prng.int(22, 55);
  const dob = new Date();
  dob.setFullYear(dob.getFullYear() - age);
  dob.setMonth(prng.int(0, 11));
  dob.setDate(prng.int(1, 28));
  const dateOfBirth = dob.toISOString().slice(0, 10);

  return {
    firstName,
    lastName,
    middleName,
    fullName,
    email,
    username,
    password,
    city,
    state,
    zipCode,
    country,
    street,
    creditCardNumber,
    cardExpiry,
    cvv,
    dateOfBirth,
    gender: gender === 'male' ? 'Male' : 'Female',
    mobileNumber,
  };
}

/** Maps a detected field type onto a related-values key when one exists. */
export function relatedValueFor(type: string, related: RelatedValues): string | undefined {
  const map: Record<string, keyof RelatedValues> = {
    firstName: 'firstName',
    lastName: 'lastName',
    middleName: 'middleName',
    fullName: 'fullName',
    email: 'email',
    username: 'username',
    password: 'password',
    confirmPassword: 'password',
    city: 'city',
    state: 'state',
    province: 'state',
    zipCode: 'zipCode',
    postalCode: 'zipCode',
    country: 'country',
    street: 'street',
    creditCardNumber: 'creditCardNumber',
    cardExpiry: 'cardExpiry',
    cvv: 'cvv',
    dateOfBirth: 'dateOfBirth',
    gender: 'gender',
    mobileNumber: 'mobileNumber',
    homeNumber: 'mobileNumber',
    officeNumber: 'mobileNumber',
  };
  const key = map[type];
  return key ? related[key] : undefined;
}

function renderPattern(prng: PRNG, pattern: string): string {
  let out = '';
  for (const ch of pattern) {
    if (ch === '#') out += String(prng.int(0, 9));
    else if (ch === 'A') out += String.fromCharCode(prng.int(65, 90));
    else out += ch;
  }
  return out;
}

/** Generates a Luhn-valid test PAN (prefix 4111… Visa-like test range). */
function luhnCard(prng: PRNG): string {
  const digits: number[] = [4, 1, 1, 1];
  while (digits.length < 15) digits.push(prng.int(0, 9));
  let sum = 0;
  const parity = (digits.length + 1) % 2;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[i] as number;
    if (i % 2 === parity) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  const check = (10 - (sum % 10)) % 10;
  digits.push(check);
  return digits.join('');
}
