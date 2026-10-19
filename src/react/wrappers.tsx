import React, { useCallback, useRef, useState } from 'react';
import { useRegisterField } from './context';
import type { FieldSignature, FillValue } from '../core/types';

export interface WithFakeFillerOptions {
  /** Prop name that holds the current text value (default: "value") */
  valueProp?: string;
  /** Prop name for the change handler (default: "onChangeText") */
  onChangeProp?: string;
  /** Derive FieldSignature from the wrapped component's props */
  getSignature?: (props: Record<string, unknown>) => FieldSignature;
  /** Default fakeFillerType when not passed as a prop */
  defaultType?: string;
}

/**
 * HOC that wraps any text-input-like component (Paper, NativeBase, Tamagui,
 * GlueStack, NativeWind-styled TextInput, etc.) so it auto-registers with
 * FakeFiller without rewriting call sites.
 *
 * ```tsx
 * import { TextInput } from 'react-native-paper';
 * const FFPaperInput = withFakeFiller(TextInput);
 * ```
 */
export function withFakeFiller<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  options: WithFakeFillerOptions = {}
): React.FC<P & { fakeFillerType?: string; fakeFillerKey?: string; label?: string; name?: string }> {
  const {
    valueProp = 'value',
    onChangeProp = 'onChangeText',
    getSignature,
    defaultType,
  } = options;

  const Wrapped: React.FC<
    P & { fakeFillerType?: string; fakeFillerKey?: string; label?: string; name?: string }
  > = (props) => {
    const {
      fakeFillerType,
      fakeFillerKey,
      label,
      name,
      ...rest
    } = props as P & {
      fakeFillerType?: string;
      fakeFillerKey?: string;
      label?: string;
      name?: string;
    };

    const restRecord = rest as Record<string, unknown>;
    const incomingValue = restRecord[valueProp];
    const incomingOnChange = restRecord[onChangeProp] as ((v: string) => void) | undefined;

    const [internal, setInternal] = useState(typeof incomingValue === 'string' ? incomingValue : '');
    const isControlled = incomingValue !== undefined;
    const current = isControlled ? String(incomingValue ?? '') : internal;

    const keyRef = useRef(
      fakeFillerKey ??
        String(restRecord.testID ?? name ?? restRecord.placeholder ?? label ?? `wrap_${Math.random().toString(36).slice(2)}`)
    );

    const setValue = useCallback(
      (v: FillValue) => {
        const str = String(v);
        if (!isControlled) setInternal(str);
        incomingOnChange?.(str);
      },
      [isControlled, incomingOnChange]
    );

    const signature: FieldSignature =
      getSignature?.(restRecord) ??
      ({
        placeholder: restRecord.placeholder as string | undefined,
        label: label ?? (restRecord.label as string | undefined),
        accessibilityLabel: restRecord.accessibilityLabel as string | undefined,
        testID: restRecord.testID as string | undefined,
        name,
        fakeFillerType: fakeFillerType ?? defaultType,
        secureTextEntry: restRecord.secureTextEntry as boolean | undefined,
        keyboardType: restRecord.keyboardType as string | undefined,
        maxLength: restRecord.maxLength as number | undefined,
      } satisfies FieldSignature);

    useRegisterField(
      keyRef.current,
      setValue,
      signature,
      fakeFillerType ?? defaultType
    );

    const merged = {
      ...restRecord,
      [valueProp]: current,
      [onChangeProp]: (v: string) => setValue(v),
      label,
    } as unknown as P;

    return <Component {...merged} />;
  };

  Wrapped.displayName = `withFakeFiller(${Component.displayName ?? Component.name ?? 'Component'})`;
  return Wrapped;
}

/**
 * Convenience wrappers that document integration with popular UI kits.
 * They are thin aliases of `withFakeFiller` so consumers can import a
 * named helper without configuring the HOC themselves.
 *
 * Usage still requires the UI-kit package as a peer — we only type the
 * props loosely so this package stays dependency-free.
 */
export function createPaperTextInputWrapper(
  PaperTextInput: React.ComponentType<Record<string, unknown>>
) {
  return withFakeFiller(PaperTextInput, {
    valueProp: 'value',
    onChangeProp: 'onChangeText',
    getSignature: (p) => ({
      placeholder: p.placeholder as string | undefined,
      label: p.label as string | undefined,
      accessibilityLabel: p.accessibilityLabel as string | undefined,
      testID: p.testID as string | undefined,
      secureTextEntry: p.secureTextEntry as boolean | undefined,
      keyboardType: p.keyboardType as string | undefined,
      maxLength: p.maxLength as number | undefined,
    }),
  });
}

export function createNativeBaseInputWrapper(
  NBInput: React.ComponentType<Record<string, unknown>>
) {
  return withFakeFiller(NBInput, {
    valueProp: 'value',
    onChangeProp: 'onChangeText',
  });
}

export function createTamaguiInputWrapper(
  TamaguiInput: React.ComponentType<Record<string, unknown>>
) {
  return withFakeFiller(TamaguiInput, {
    valueProp: 'value',
    onChangeProp: 'onChangeText',
  });
}

export function createGlueStackInputWrapper(
  GSInput: React.ComponentType<Record<string, unknown>>
) {
  return withFakeFiller(GSInput, {
    valueProp: 'value',
    onChangeProp: 'onChangeText',
  });
}
