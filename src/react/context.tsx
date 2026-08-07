import React, { createContext, useContext, useMemo, useRef, useCallback } from 'react';
import { fakeFillerEngine } from '../core/FakeFiller';
import type { FieldSignature, FillOptions, RegisteredField } from '../core/types';

interface FakeFillerContextValue {
  registerField: (field: RegisteredField) => void;
  unregisterField: (key: string) => void;
  fillScreen: (options?: FillOptions) => { filled: number; skipped: number };
  clearFields: () => void;
  fieldCount: () => number;
}

const FakeFillerContext = createContext<FakeFillerContextValue | null>(null);

export interface FakeFillerProviderProps {
  children: React.ReactNode;
  /**
   * When false, all FakeFiller operations become no-ops (registration still
   * happens cheaply, but there's no runtime overhead beyond that). Defaults
   * to `__DEV__` so production builds never ship fake-filling behavior.
   */
  enabled?: boolean;
}

/**
 * Wrap your app (or an individual screen/form) in this provider to enable
 * zero-config field auto-registration. Nesting providers is supported —
 * `fillScreen()` called from a hook inside a nested provider only fills
 * fields registered within that subtree.
 */
export function FakeFillerProvider({ children, enabled }: FakeFillerProviderProps) {
  const isEnabled = enabled ?? (typeof __DEV__ !== 'undefined' ? __DEV__ : true);
  const fieldsRef = useRef(new Map<string, RegisteredField>());

  const registerField = useCallback(
    (field: RegisteredField) => {
      if (!isEnabled) return;
      fieldsRef.current.set(field.key, field);
    },
    [isEnabled]
  );

  const unregisterField = useCallback((key: string) => {
    fieldsRef.current.delete(key);
  }, []);

  const fillScreen = useCallback(
    (options?: FillOptions) => {
      if (!isEnabled) return { filled: 0, skipped: 0 };
      let filled = 0;
      let skipped = 0;
      for (const field of fieldsRef.current.values()) {
        fakeFillerEngine.registerField(field);
      }
      const result = fakeFillerEngine.fillScreen(options);
      filled = result.filled;
      skipped = result.skipped;
      fakeFillerEngine.clearFieldRegistry();
      return { filled, skipped };
    },
    [isEnabled]
  );

  const clearFields = useCallback(() => {
    for (const field of fieldsRef.current.values()) {
      field.setValue('');
    }
  }, []);

  const fieldCount = useCallback(() => fieldsRef.current.size, []);

  const value = useMemo<FakeFillerContextValue>(
    () => ({ registerField, unregisterField, fillScreen, clearFields, fieldCount }),
    [registerField, unregisterField, fillScreen, clearFields, fieldCount]
  );

  return <FakeFillerContext.Provider value={value}>{children}</FakeFillerContext.Provider>;
}

export function useFakeFillerContext(): FakeFillerContextValue | null {
  return useContext(FakeFillerContext);
}

/**
 * Registers a single field's setter + signature with the nearest
 * `FakeFillerProvider`, and unregisters it automatically on unmount. This
 * is what powers auto-detection for wrapped inputs (`<FFTextInput>`) and
 * is also exposed directly for custom components.
 */
export function useRegisterField(
  key: string,
  setValue: (value: string) => void,
  signature: FieldSignature,
  type?: string
): void {
  const ctx = useFakeFillerContext();
  React.useEffect(() => {
    if (!ctx) return;
    ctx.registerField({ key, setValue, signature, type });
    return () => ctx.unregisterField(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, key, signature.placeholder, signature.label, signature.accessibilityLabel, signature.testID, signature.id, signature.name, type]);
}
