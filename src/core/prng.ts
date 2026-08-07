/**
 * Deterministic, seedable pseudo-random number generator (mulberry32).
 * Used so that `FakeFiller.seed(n)` can reproduce the exact same dataset
 * across runs, while `random`/`unique` modes seed from real entropy.
 */
export class PRNG {
  private state: number;

  constructor(seed?: number) {
    this.state = (seed ?? PRNG.randomSeed()) >>> 0;
  }

  private static randomSeed(): number {
    // Cheap, non-cryptographic entropy source. Good enough for fake data,
    // never used for anything security sensitive.
    return (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
  }

  reseed(seed: number): void {
    this.state = seed >>> 0;
  }

  /** Returns a float in [0, 1) */
  next(): number {
    this.state |= 0;
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Integer in [min, max] inclusive */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Float in [min, max) with given decimal precision */
  float(min: number, max: number, precision = 2): number {
    const value = this.next() * (max - min) + min;
    const factor = 10 ** precision;
    return Math.round(value * factor) / factor;
  }

  bool(probabilityTrue = 0.5): boolean {
    return this.next() < probabilityTrue;
  }

  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) {
      throw new Error('FakeFiller: cannot pick from an empty array');
    }
    return arr[this.int(0, arr.length - 1)] as T;
  }

  shuffle<T>(arr: readonly T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
    }
    return copy;
  }

  /** Random digit string of a given length, optionally disallowing a leading zero */
  digits(length: number, noLeadingZero = false): string {
    let out = '';
    for (let i = 0; i < length; i++) {
      const d = i === 0 && noLeadingZero ? this.int(1, 9) : this.int(0, 9);
      out += String(d);
    }
    return out;
  }

  hex(length: number): string {
    const chars = '0123456789abcdef';
    let out = '';
    for (let i = 0; i < length; i++) out += chars[this.int(0, 15)];
    return out;
  }

  alphaNumeric(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let out = '';
    for (let i = 0; i < length; i++) out += chars[this.int(0, chars.length - 1)];
    return out;
  }
}
