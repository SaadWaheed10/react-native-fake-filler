import type { FillSnapshot, FillValue } from './types';
import { fakeFillerEngine } from './FakeFiller';

export interface ExpectedRequestBody {
  /** Values from the last fill, keyed by field key */
  values: Record<string, FillValue>;
  /** Same values coerced to JSON-safe strings/numbers/booleans */
  json: Record<string, string | number | boolean | null>;
  /** Pretty-printed JSON string of `json` */
  body: string;
  snapshotId?: string;
  timestamp: number;
}

/**
 * Converts the last fill into the shape you'd expect a signup/checkout
 * API request body to look like — useful for asserting against MSW / Mirage
 * handlers or logging what the form "would" POST.
 *
 * @example
 * ```ts
 * FakeFiller.fillScreen({ scenario: 'signup' });
 * const expected = FakeFiller.expectedRequestBody();
 * // in MSW: expect(await req.json()).toMatchObject(expected.json)
 * ```
 */
export function expectedRequestBody(
  snapshotId?: string,
  mapKeys?: (key: string) => string
): ExpectedRequestBody {
  const history = fakeFillerEngine.getHistory();
  const snap: FillSnapshot | undefined = snapshotId
    ? history.find((s) => s.id === snapshotId)
    : history[history.length - 1];

  const values = snap?.values ?? fakeFillerEngine.exportRegisteredValues();
  const json: Record<string, string | number | boolean | null> = {};

  for (const [key, value] of Object.entries(values)) {
    const outKey = mapKeys ? mapKeys(key) : key;
    if (value instanceof Date) {
      json[outKey] = value.toISOString();
    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      json[outKey] = value;
    } else {
      json[outKey] = value == null ? null : String(value);
    }
  }

  return {
    values,
    json,
    body: JSON.stringify(json, null, 2),
    snapshotId: snap?.id,
    timestamp: snap?.timestamp ?? Date.now(),
  };
}

/**
 * Assert helper (Jest-friendly). Compares a received request body object
 * against the last fill's expected JSON. Returns { ok, missing, extra, mismatches }.
 */
export function matchRequestBody(
  received: Record<string, unknown>,
  snapshotId?: string
): {
  ok: boolean;
  missing: string[];
  extra: string[];
  mismatches: Array<{ key: string; expected: unknown; received: unknown }>;
} {
  const expected = expectedRequestBody(snapshotId).json;
  const missing: string[] = [];
  const extra: string[] = [];
  const mismatches: Array<{ key: string; expected: unknown; received: unknown }> = [];

  for (const key of Object.keys(expected)) {
    if (!(key in received)) {
      missing.push(key);
      continue;
    }
    if (String(received[key]) !== String(expected[key])) {
      mismatches.push({ key, expected: expected[key], received: received[key] });
    }
  }
  for (const key of Object.keys(received)) {
    if (!(key in expected)) extra.push(key);
  }

  return {
    ok: missing.length === 0 && mismatches.length === 0,
    missing,
    extra,
    mismatches,
  };
}
