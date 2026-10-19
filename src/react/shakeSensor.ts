/**
 * Optional Accelerometer bridge. Prefer expo-sensors when present so we
 * don't add a hard native dependency. Resolves to null when unavailable.
 */
export type AccelSubscription = { remove: () => void };

export type AccelModule = {
  setUpdateInterval?: (ms: number) => void;
  addListener: (cb: (data: { x: number; y: number; z: number }) => void) => AccelSubscription;
};

function tryLoad(): AccelModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-sensors');
    return mod?.Accelerometer ?? null;
  } catch {
    return null;
  }
}

export const Accelerometer: AccelModule | null = tryLoad();
