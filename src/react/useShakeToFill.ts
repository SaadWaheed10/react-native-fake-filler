import { useEffect, useRef } from 'react';
import { Accelerometer } from './shakeSensor';
import { useFakeFiller } from './useFakeFiller';
import type { FillOptions } from '../core/types';

export interface UseShakeToFillOptions extends FillOptions {
  /** Minimum acceleration magnitude to count as a shake (default 1.8) */
  threshold?: number;
  /** Cooldown between fills in ms (default 1500) */
  cooldownMs?: number;
  /** When false, listener is inactive */
  enabled?: boolean;
}

/**
 * Shake the device to fill the current screen. Uses `expo-sensors`
 * Accelerometer when available; no-ops (with a one-time console hint)
 * when the optional peer is missing.
 *
 * ```tsx
 * useShakeToFill({ scenario: 'signup' });
 * ```
 */
export function useShakeToFill(options: UseShakeToFillOptions = {}): void {
  const { fill } = useFakeFiller();
  const { threshold = 1.8, cooldownMs = 1500, enabled = true, ...fillOptions } = options;
  const lastFill = useRef(0);
  const fillRef = useRef(fill);
  const optsRef = useRef(fillOptions);
  fillRef.current = fill;
  optsRef.current = fillOptions;

  useEffect(() => {
    if (!enabled) return;
    if (!Accelerometer) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        // eslint-disable-next-line no-console
        console.info(
          '[FakeFiller] useShakeToFill: install expo-sensors to enable shake-to-fill, or use FakeFillerDevToolbar.'
        );
      }
      return;
    }

    Accelerometer.setUpdateInterval?.(100);
    const sub = Accelerometer.addListener(({ x, y, z }: { x: number; y: number; z: number }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      if (magnitude < threshold) return;
      const now = Date.now();
      if (now - lastFill.current < cooldownMs) return;
      lastFill.current = now;
      fillRef.current(optsRef.current);
    });

    return () => {
      sub?.remove?.();
    };
  }, [enabled, threshold, cooldownMs]);
}
