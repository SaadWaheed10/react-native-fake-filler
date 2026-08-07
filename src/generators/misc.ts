import { PRNG } from '../core/prng';
import { UniquenessTracker } from '../core/uniqueness';
import type { GeneratorContext } from '../core/types';

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function makeMiscGenerators(prng: PRNG, uniq: UniquenessTracker) {
  function uuid(ctx: GeneratorContext): string {
    const gen = () => {
      const h = () => prng.hex(4);
      return `${prng.hex(8)}-${h()}-4${prng.hex(3)}-${prng.pick(['8', '9', 'a', 'b'])}${prng.hex(3)}-${prng.hex(12)}`;
    };
    if (ctx.mode === 'unique') return uniq.unique('uuid', gen, () => prng.hex(2));
    return gen();
  }

  function apiKey(): string {
    return `sk_test_${prng.alphaNumeric(32)}`;
  }

  function refreshToken(): string {
    return `rtk_${prng.alphaNumeric(40)}`;
  }

  function accessToken(): string {
    return `atk_${prng.alphaNumeric(40)}`;
  }

  function domain(ctx: GeneratorContext): string {
    const gen = () => `${prng.alphaNumeric(8).toLowerCase()}.example.com`;
    if (ctx.mode === 'unique') return uniq.unique('domain', gen, () => prng.digits(2));
    return gen();
  }

  function url(ctx: GeneratorContext): string {
    return `https://${domain(ctx)}/${prng.alphaNumeric(6).toLowerCase()}`;
  }

  function ipv4(): string {
    return `${prng.int(1, 254)}.${prng.int(0, 254)}.${prng.int(0, 254)}.${prng.int(1, 254)}`;
  }

  function ipv6(): string {
    return Array.from({ length: 8 }, () => prng.hex(4)).join(':');
  }

  function macAddress(): string {
    return Array.from({ length: 6 }, () => prng.hex(2)).join(':').toUpperCase();
  }

  function loremWord(): string {
    return prng.pick(LOREM_WORDS);
  }

  function sentence(): string {
    const len = prng.int(6, 12);
    const words = Array.from({ length: len }, () => prng.pick(LOREM_WORDS));
    const s = words.join(' ');
    return s.charAt(0).toUpperCase() + s.slice(1) + '.';
  }

  function paragraph(): string {
    const count = prng.int(3, 5);
    return Array.from({ length: count }, () => sentence()).join(' ');
  }

  function review(): string {
    const openers = ['Great experience overall.', 'Really happy with this.', 'Works as expected.', 'Could be better, but solid.'];
    return `${prng.pick(openers)} ${sentence()}`;
  }

  function description(): string {
    return paragraph();
  }

  function comment(): string {
    return sentence();
  }

  function integer(): string {
    return String(prng.int(0, 1000));
  }

  function float(): string {
    return String(prng.float(0, 1000, 2));
  }

  function percentage(): string {
    return `${prng.int(0, 100)}%`;
  }

  function currency(): string {
    return `$${prng.float(1, 5000, 2).toFixed(2)}`;
  }

  function formatDate(d: Date): string {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  function pastDate(): string {
    const now = new Date();
    const daysAgo = prng.int(1, 3650);
    const d = new Date(now.getTime() - daysAgo * 86400000);
    return formatDate(d);
  }

  function futureDate(): string {
    const now = new Date();
    const daysAhead = prng.int(1, 3650);
    const d = new Date(now.getTime() + daysAhead * 86400000);
    return formatDate(d);
  }

  function currentDate(): string {
    return formatDate(new Date());
  }

  function randomDate(): string {
    return prng.bool() ? pastDate() : futureDate();
  }

  return {
    uuid,
    apiKey,
    refreshToken,
    accessToken,
    domain,
    url,
    ipv4,
    ipv6,
    macAddress,
    loremWord,
    sentence,
    paragraph,
    review,
    description,
    comment,
    integer,
    float,
    percentage,
    currency,
    pastDate,
    futureDate,
    currentDate,
    randomDate,
  };
}
