import type { ChaosKind, FillValue } from './types';

const XSS = `<img src=x onerror="alert('xss')">`;
const SQL = `' OR '1'='1'; --`;
const EMOJI = '🔥🚀✨🧙‍♂️测试';
const OVERSIZED = 'A'.repeat(10000);
const RTL = '\u202Eevil\u202C';

/**
 * Returns a chaos/negative value for a given field type.
 * Used when FillOptions.mode === 'chaos' or options.chaos is set.
 */
export function chaosValueFor(type: string, kind: ChaosKind = 'mixed'): FillValue {
  const resolved: ChaosKind =
    kind === 'mixed' ? pickKindForType(type) : kind;

  switch (resolved) {
    case 'invalid-email':
      if (type === 'email' || type.includes('email')) return 'not-an-email';
      break;
    case 'mismatched-password':
      if (type === 'password') return 'GoodPass!123';
      if (type === 'confirmPassword') return 'DifferentPass!999';
      break;
    case 'expired-card':
      if (type === 'creditCardNumber') return '4111111111111111';
      if (type === 'cardExpiry') return '01/20';
      if (type === 'cvv') return '000';
      break;
    case 'underage':
      if (type === 'dateOfBirth' || type === 'date') return '2018-06-15';
      if (type === 'age') return '8';
      break;
    case 'xss':
      return XSS;
    case 'sql-injection':
      return SQL;
    case 'emoji-name':
      if (
        type === 'firstName' ||
        type === 'lastName' ||
        type === 'fullName' ||
        type === 'username' ||
        type === 'nickname'
      ) {
        return EMOJI;
      }
      return `${EMOJI} ${type}`;
    case 'oversized':
      return OVERSIZED;
    case 'empty':
      return '';
    case 'whitespace':
      return '   \t\n  ';
    case 'unicode-rtl':
      return RTL;
    default:
      break;
  }

  // Fallbacks by type when specific kind didn't match
  if (type === 'email') return 'bad@@email..com';
  if (type === 'confirmPassword') return 'Mismatch!999';
  if (type === 'password') return 'GoodPass!123';
  if (type === 'cardExpiry') return '01/20';
  if (type === 'dateOfBirth') return '2018-01-01';
  if (type === 'age') return '10';
  if (type === 'creditCardNumber') return '0000000000000000';
  if (type === 'mobileNumber' || type === 'homeNumber' || type === 'officeNumber') return '123';
  if (type === 'zipCode' || type === 'postalCode') return '!!';
  if (type === 'switch' || type === 'checkbox' || type === 'boolean') return false;
  return XSS;
}

function pickKindForType(type: string): ChaosKind {
  if (type === 'email') return 'invalid-email';
  if (type === 'password' || type === 'confirmPassword') return 'mismatched-password';
  if (type === 'creditCardNumber' || type === 'cardExpiry' || type === 'cvv') return 'expired-card';
  if (type === 'dateOfBirth' || type === 'age' || type === 'date') return 'underage';
  if (type === 'firstName' || type === 'lastName' || type === 'fullName') return 'emoji-name';
  if (type === 'description' || type === 'comment' || type === 'paragraph') return 'oversized';
  return 'xss';
}

export function resolveChaosKind(chaos: boolean | ChaosKind | undefined): ChaosKind | undefined {
  if (chaos === undefined || chaos === false) return undefined;
  if (chaos === true) return 'mixed';
  return chaos;
}
