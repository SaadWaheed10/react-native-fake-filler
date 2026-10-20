import { registerPersona, type PersonaProfile } from './personas';
import { registerScenario, type ScenarioDefinition } from './scenarios';

export interface RemotePack {
  personas?: PersonaProfile[];
  scenarios?: ScenarioDefinition[];
  version?: string;
  source?: string;
}

export interface SyncResult {
  ok: boolean;
  personas: number;
  scenarios: number;
  error?: string;
  pack?: RemotePack;
}

/**
 * Fetches a shared JSON pack of personas/scenarios (e.g. GitHub gist raw URL)
 * and registers them locally so QA and eng share the same staging users.
 *
 * Expected JSON shape:
 * ```json
 * {
 *   "version": "1",
 *   "personas": [{ "id": "staging-user", "label": "...", "locale": "en-US", "values": { ... } }],
 *   "scenarios": [{ "id": "staging-signup", "label": "...", "description": "", "options": {}, "overrides": {} }]
 * }
 * ```
 */
export async function syncFromUrl(url: string, init?: RequestInit): Promise<SyncResult> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      return { ok: false, personas: 0, scenarios: 0, error: `HTTP ${res.status}` };
    }
    const pack = (await res.json()) as RemotePack;
    return applyRemotePack(pack);
  } catch (e) {
    return {
      ok: false,
      personas: 0,
      scenarios: 0,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/** Apply an already-fetched / local JSON pack. */
export function applyRemotePack(pack: RemotePack): SyncResult {
  let personas = 0;
  let scenarios = 0;

  for (const p of pack.personas ?? []) {
    if (p?.id && p.values) {
      registerPersona(p);
      personas++;
    }
  }
  for (const s of pack.scenarios ?? []) {
    if (s?.id) {
      registerScenario(s);
      scenarios++;
    }
  }

  return { ok: true, personas, scenarios, pack };
}
