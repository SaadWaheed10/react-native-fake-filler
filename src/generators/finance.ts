import { PRNG } from '../core/prng';
import { UniquenessTracker } from '../core/uniqueness';
import type { GeneratorContext } from '../core/types';

/**
 * IMPORTANT: These are well-known, publicly documented *test* card numbers
 * used by payment processor sandboxes (e.g. Stripe/Braintree test suites).
 * They are Luhn-valid but cannot be used for real transactions. FakeFiller
 * never generates or stores real cardholder data.
 */
const TEST_CARD_NUMBERS = [
  '4242424242424242', // Visa test
  '4111111111111111', // Visa test
  '5555555555554444', // Mastercard test
  '378282246310005', // Amex test
  '6011111111111117', // Discover test
];

const BANK_NAMES = ['First National Test Bank', 'Sandbox Trust Bank', 'QA Federal Bank', 'Mock Savings Bank'];

const VEHICLE_MAKES: Record<string, string[]> = {
  Toyota: ['Corolla', 'Camry', 'RAV4', 'Yaris'],
  Honda: ['Civic', 'Accord', 'CR-V'],
  Ford: ['Focus', 'Fiesta', 'Escape'],
  Volkswagen: ['Golf', 'Polo', 'Tiguan'],
  BMW: ['3 Series', 'X1', '5 Series'],
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function makeFinanceGenerators(prng: PRNG, uniq: UniquenessTracker) {
  function creditCardNumber(): string {
    return prng.pick(TEST_CARD_NUMBERS);
  }

  function cardExpiry(): string {
    const month = prng.int(1, 12);
    const year = new Date().getFullYear() + prng.int(1, 5);
    return `${pad2(month)}/${String(year).slice(-2)}`;
  }

  function cvv(): string {
    return prng.digits(3);
  }

  function accountNumber(ctx: GeneratorContext): string {
    const gen = () => prng.digits(10, true);
    if (ctx.mode === 'unique') return uniq.unique('accountNumber', gen, () => prng.digits(2));
    return gen();
  }

  function iban(ctx: GeneratorContext): string {
    const gen = () => `GB${prng.digits(2)}TEST${prng.digits(14)}`;
    if (ctx.mode === 'unique') return uniq.unique('iban', gen, () => prng.digits(2));
    return gen();
  }

  function bankName(): string {
    return prng.pick(BANK_NAMES);
  }

  function vehicleManufacturer(): string {
    return prng.pick(Object.keys(VEHICLE_MAKES));
  }

  function vehicleModel(manufacturer?: string): string {
    const make = manufacturer ?? prng.pick(Object.keys(VEHICLE_MAKES));
    return prng.pick(VEHICLE_MAKES[make] ?? ['Model X']);
  }

  function vehicleNumber(ctx: GeneratorContext): string {
    const gen = () => `${prng.alphaNumeric(2).toUpperCase()}-${prng.digits(4)}`;
    if (ctx.mode === 'unique') return uniq.unique('vehicleNumber', gen, () => prng.digits(2));
    return gen();
  }

  function licensePlate(ctx: GeneratorContext): string {
    const gen = () => `${prng.alphaNumeric(3).toUpperCase()}-${prng.digits(3)}`;
    if (ctx.mode === 'unique') return uniq.unique('licensePlate', gen, () => prng.digits(2));
    return gen();
  }

  function vin(ctx: GeneratorContext): string {
    const gen = () => prng.alphaNumeric(17).toUpperCase();
    if (ctx.mode === 'unique') return uniq.unique('vin', gen, () => prng.digits(2));
    return gen();
  }

  return {
    creditCardNumber,
    cardExpiry,
    cvv,
    accountNumber,
    iban,
    bankName,
    vehicleManufacturer,
    vehicleModel,
    vehicleNumber,
    licensePlate,
    vin,
  };
}
