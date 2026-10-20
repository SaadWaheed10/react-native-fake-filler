import type { LocaleCode } from './types';
import { getLocale } from '../locales/data';

export interface NewUserIdentity {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  mobileNumber: string;
  deviceId: string;
  /** Millisecond timestamp used in uniqueness suffixes */
  stamp: number;
  locale: LocaleCode;
  /** Flat overrides map ready for fillScreen({ overrides }) */
  asOverrides: () => Record<string, string>;
}

function uuidLike(): string {
  const h = () => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  return `${h()}${h()}-${h()}-4${h().slice(1)}-${h()}-${h()}${h()}${h()}`;
}

/**
 * Builds a brand-new, API-safe identity that is extremely unlikely to collide
 * with any previously registered user (timestamp + uuid suffix on email/phone).
 *
 * Use this for signup / OTP / verify flows where the backend rejects duplicates.
 */
export function createNewUser(locale: LocaleCode = 'en-US'): NewUserIdentity {
  const data = getLocale(locale);
  const stamp = Date.now();
  const short = stamp.toString(36);
  const deviceId = `dev_${uuidLike()}`;
  const firstName = data.firstNamesMale[stamp % data.firstNamesMale.length] as string;
  const lastName = data.lastNames[(stamp >> 3) % data.lastNames.length] as string;
  const fullName = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${short}@example.com`;
  const username = `${firstName.toLowerCase()}_${short}`;
  const password = `ApiTest!${short.slice(-6)}`;
  const dial = data.countryDialCode.replace('+', '');
  const mobileNumber = `+${dial}${String(stamp).slice(-10)}`;

  const identity: NewUserIdentity = {
    firstName,
    lastName,
    fullName,
    email,
    username,
    password,
    confirmPassword: password,
    mobileNumber,
    deviceId,
    stamp,
    locale,
    asOverrides() {
      return {
        firstName: identity.firstName,
        lastName: identity.lastName,
        fullName: identity.fullName,
        email: identity.email,
        username: identity.username,
        password: identity.password,
        confirmPassword: identity.confirmPassword,
        mobileNumber: identity.mobileNumber,
      };
    },
  };

  return identity;
}
