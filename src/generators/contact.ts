import { PRNG } from '../core/prng';
import { UniquenessTracker } from '../core/uniqueness';
import { getLocale } from '../locales/data';
import type { GeneratorContext } from '../core/types';

function renderPattern(prng: PRNG, pattern: string): string {
  let out = '';
  for (const ch of pattern) {
    if (ch === '#') out += String(prng.int(0, 9));
    else if (ch === 'A') out += String.fromCharCode(prng.int(65, 90));
    else out += ch;
  }
  return out;
}

export function makeContactGenerators(prng: PRNG, uniq: UniquenessTracker) {
  function phoneNumber(ctx: GeneratorContext): string {
    const locale = getLocale(ctx.locale);
    const gen = () => renderPattern(prng, locale.phoneFormat);
    if (ctx.mode === 'unique') {
      return uniq.unique('phone', gen, () => String(prng.int(0, 9)));
    }
    return gen();
  }

  function countryCode(ctx: GeneratorContext): string {
    return getLocale(ctx.locale).countryDialCode;
  }

  function street(ctx: GeneratorContext): string {
    return prng.pick(getLocale(ctx.locale).streets);
  }

  function houseNumber(): string {
    return String(prng.int(1, 9999));
  }

  function apartment(): string {
    return `Apt ${prng.int(1, 40)}${prng.pick(['A', 'B', 'C', ''])}`;
  }

  function building(): string {
    const names = ['Skyline Tower', 'Riverside Court', 'Maple Residency', 'The Grand', 'Oakwood Heights'];
    return prng.pick(names);
  }

  function city(ctx: GeneratorContext): string {
    return prng.pick(getLocale(ctx.locale).cities);
  }

  function state(ctx: GeneratorContext): string {
    return prng.pick(getLocale(ctx.locale).states);
  }

  function country(ctx: GeneratorContext): string {
    return getLocale(ctx.locale).countryName;
  }

  function zipCode(ctx: GeneratorContext): string {
    return renderPattern(prng, getLocale(ctx.locale).postalCodeFormat());
  }

  return {
    phoneNumber,
    countryCode,
    street,
    houseNumber,
    apartment,
    building,
    city,
    state,
    country,
    zipCode,
  };
}
