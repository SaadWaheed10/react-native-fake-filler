import type { FillOptions, FillSnapshot, FillValue } from './types';

const DEFAULT_LIMIT = 20;

/**
 * Ring buffer of recent fill snapshots. Powers Replay / Export in the
 * developer toolbar and `FakeFiller.history()` / `replay()`.
 */
export class FillHistory {
  private snapshots: FillSnapshot[] = [];
  private limit: number;
  private seq = 0;

  constructor(limit = DEFAULT_LIMIT) {
    this.limit = limit;
  }

  setLimit(limit: number): void {
    this.limit = Math.max(1, limit);
    if (this.snapshots.length > this.limit) {
      this.snapshots = this.snapshots.slice(-this.limit);
    }
  }

  push(
    values: Record<string, FillValue>,
    types: Record<string, string>,
    options?: FillOptions
  ): FillSnapshot {
    this.seq += 1;
    const snapshot: FillSnapshot = {
      id: `ff_${Date.now()}_${this.seq}`,
      timestamp: Date.now(),
      values: { ...values },
      types: { ...types },
      options,
      persona: typeof options?.persona === 'string' ? options.persona : undefined,
      scenario: typeof options?.scenario === 'string' ? options.scenario : undefined,
    };
    this.snapshots.push(snapshot);
    if (this.snapshots.length > this.limit) {
      this.snapshots.shift();
    }
    return snapshot;
  }

  list(): FillSnapshot[] {
    return [...this.snapshots];
  }

  latest(): FillSnapshot | undefined {
    return this.snapshots[this.snapshots.length - 1];
  }

  get(id: string): FillSnapshot | undefined {
    return this.snapshots.find((s) => s.id === id);
  }

  clear(): void {
    this.snapshots = [];
  }

  /** JSON-serialisable export of the latest (or specified) snapshot. */
  exportJson(id?: string): string {
    const snap = id ? this.get(id) : this.latest();
    return JSON.stringify(snap ?? {}, null, 2);
  }

  /** Flat key→string map suitable for Maestro env injection. */
  exportEnv(id?: string): Record<string, string> {
    const snap = id ? this.get(id) : this.latest();
    if (!snap) return {};
    const env: Record<string, string> = {};
    for (const [key, value] of Object.entries(snap.values)) {
      env[key] = value instanceof Date ? value.toISOString() : String(value);
    }
    return env;
  }
}
