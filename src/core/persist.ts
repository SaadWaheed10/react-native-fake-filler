import type { FillSnapshot } from './types';
import { fakeFillerEngine } from './FakeFiller';

const STORAGE_KEY = '@fake_filler/history_v1';

type StorageLike = {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem?: (key: string) => Promise<void> | void;
};

function tryLoadStorage(): StorageLike | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mmkvMod = require('react-native-mmkv');
    if (mmkvMod?.MMKV || mmkvMod?.createMMKV) {
      const storage = mmkvMod.createMMKV
        ? mmkvMod.createMMKV({ id: 'fake-filler' })
        : new mmkvMod.MMKV({ id: 'fake-filler' });
      return {
        getItem: (k) => storage.getString(k) ?? null,
        setItem: (k, v) => {
          storage.set(k, v);
        },
        removeItem: (k) => {
          storage.delete(k);
        },
      };
    }
  } catch {
    // ignore
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const as = require('@react-native-async-storage/async-storage');
    const AsyncStorage = as.default ?? as;
    if (AsyncStorage?.getItem) return AsyncStorage as StorageLike;
  } catch {
    // ignore
  }

  return null;
}

let customStorage: StorageLike | null = null;

/** Inject your own storage (useful in tests or when using a custom key-value store). */
export function setPersistStorage(storage: StorageLike | null): void {
  customStorage = storage;
}

function storage(): StorageLike | null {
  return customStorage ?? tryLoadStorage();
}

/** Persist the current in-memory fill history (or a specific snapshot list). */
export async function persistHistory(snapshots?: FillSnapshot[]): Promise<boolean> {
  const store = storage();
  if (!store) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      // eslint-disable-next-line no-console
      console.info(
        '[FakeFiller] persistHistory: install @react-native-async-storage/async-storage or react-native-mmkv'
      );
    }
    return false;
  }
  const data = snapshots ?? fakeFillerEngine.getHistory();
  await store.setItem(STORAGE_KEY, JSON.stringify(data));
  return true;
}

/** Load persisted history and return it (does not auto-replay). */
export async function loadPersistedHistory(): Promise<FillSnapshot[]> {
  const store = storage();
  if (!store) return [];
  const raw = await store.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as FillSnapshot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Load last snapshot into engine history and replay onto registered fields. */
export async function restoreLastFill(): Promise<{ restored: boolean; snapshot?: FillSnapshot }> {
  const snaps = await loadPersistedHistory();
  const last = snaps[snaps.length - 1];
  if (!last) return { restored: false };
  fakeFillerEngine.importHistory(snaps);
  const result = fakeFillerEngine.replay(last.id);
  return { restored: result.filled > 0 || Object.keys(last.values).length > 0, snapshot: last };
}

export async function clearPersistedHistory(): Promise<void> {
  const store = storage();
  if (!store?.removeItem) {
    if (store) await store.setItem(STORAGE_KEY, '[]');
    return;
  }
  await store.removeItem(STORAGE_KEY);
}
