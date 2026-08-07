/**
 * Tracks values already generated in the current session (per field bucket)
 * so that "unique" mode can avoid collisions without the caller having to
 * think about it. Buckets are cleared on `FakeFiller.reset()`.
 */
export class UniquenessTracker {
  private buckets = new Map<string, Set<string>>();

  private bucket(name: string): Set<string> {
    let b = this.buckets.get(name);
    if (!b) {
      b = new Set();
      this.buckets.set(name, b);
    }
    return b;
  }

  has(bucket: string, value: string): boolean {
    return this.bucket(bucket).has(value);
  }

  add(bucket: string, value: string): void {
    this.bucket(bucket).add(value);
  }

  /**
   * Calls `produce` repeatedly until it returns a value not seen before in
   * `bucket`, then records and returns it. Falls back to appending a short
   * random suffix after `maxAttempts` to guarantee termination.
   */
  unique(
    bucket: string,
    produce: () => string,
    suffix: () => string,
    maxAttempts = 25
  ): string {
    for (let i = 0; i < maxAttempts; i++) {
      const candidate = produce();
      if (!this.has(bucket, candidate)) {
        this.add(bucket, candidate);
        return candidate;
      }
    }
    // Extremely unlikely fallback: force uniqueness with a suffix.
    let candidate = `${produce()}${suffix()}`;
    while (this.has(bucket, candidate)) {
      candidate = `${candidate}${suffix()}`;
    }
    this.add(bucket, candidate);
    return candidate;
  }

  reset(bucket?: string): void {
    if (bucket) {
      this.buckets.delete(bucket);
    } else {
      this.buckets.clear();
    }
  }
}
