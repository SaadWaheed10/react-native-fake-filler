import { PRNG } from '../core/prng';
import { UniquenessTracker } from '../core/uniqueness';
import { getLocale } from '../locales/data';
import type { GeneratorContext } from '../core/types';

const SYMBOLS = ['!', '#', '$', '%', '&', '*'];

export function makeNameGenerators(prng: PRNG, uniq: UniquenessTracker) {
  function pickGender(): 'male' | 'female' {
    return prng.bool() ? 'male' : 'female';
  }

  function firstName(ctx: GeneratorContext, gender?: 'male' | 'female'): string {
    const locale = getLocale(ctx.locale);
    const g = gender ?? pickGender();
    const pool = g === 'male' ? locale.firstNamesMale : locale.firstNamesFemale;
    return prng.pick(pool);
  }

  function lastName(ctx: GeneratorContext): string {
    return prng.pick(getLocale(ctx.locale).lastNames);
  }

  function fullName(ctx: GeneratorContext): string {
    return `${firstName(ctx)} ${lastName(ctx)}`;
  }

  function middleName(ctx: GeneratorContext): string {
    return firstName(ctx);
  }

  function nickname(ctx: GeneratorContext): string {
    const first = firstName(ctx);
    return `${first}${prng.int(1, 99)}`;
  }

  function initials(ctx: GeneratorContext): string {
    return `${firstName(ctx)[0]}${lastName(ctx)[0]}`.toUpperCase();
  }

  function username(ctx: GeneratorContext): string {
    const gen = () => {
      const first = firstName(ctx).toLowerCase();
      const suffix = prng.digits(4);
      return `${first}${suffix}`;
    };
    if (ctx.mode === 'unique') {
      return uniq.unique('username', gen, () => prng.digits(2));
    }
    return gen();
  }

  function email(ctx: GeneratorContext): string {
    const gen = () => {
      const first = firstName(ctx).toLowerCase();
      const last = lastName(ctx).toLowerCase();
      const suffix = prng.digits(5);
      return `${first}.${last}.${suffix}@example.com`;
    };
    if (ctx.mode === 'unique') {
      return uniq.unique('email', gen, () => prng.digits(2));
    }
    return gen();
  }

  function password(): string {
    const words = ['Storm', 'Falcon', 'Nebula', 'Quartz', 'Ember', 'Frost', 'Comet', 'Orbit'];
    const word = prng.pick(words);
    const symbol = prng.pick(SYMBOLS);
    return `My${word}${symbol}${prng.int(10, 99)}`;
  }

  function otp(): string {
    return prng.digits(6);
  }

  function pin(): string {
    return prng.digits(4);
  }

  function securityAnswer(): string {
    const answers = ['Blue', 'Riverside', 'Maplewood', 'Shadow', 'Compass', 'Harbor'];
    return prng.pick(answers);
  }

  return {
    firstName,
    lastName,
    fullName,
    middleName,
    nickname,
    initials,
    username,
    email,
    password,
    otp,
    pin,
    securityAnswer,
  };
}
