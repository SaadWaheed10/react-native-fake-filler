import React, { useCallback, useRef, useState } from 'react';
import { TextInput } from 'react-native';
import type { TextInputProps } from 'react-native';
import { useRegisterField } from './context';
import type { FieldSignature } from '../core/types';

export interface FFTextInputProps extends TextInputProps {
  /**
   * Explicit field type (e.g. "email", "firstName"). When omitted,
   * FakeFiller detects the type from placeholder/label/accessibilityLabel/
   * name/testID, same as it would for a plain TextInput.
   */
  fakeFillerType?: string;
  /** A stable key for this field within the current screen/provider. Defaults to testID, then name, then placeholder. */
  fakeFillerKey?: string;
  /** Optional field name, used purely for detection (RN's TextInput has no native `name` prop). */
  name?: string;
  label?: string;
}

/**
 * Drop-in replacement for React Native's `TextInput` that auto-registers
 * itself with the nearest `FakeFillerProvider`. This is the recommended way
 * to opt a field into `fillScreen()` — because React Native has no DOM to
 * query, FakeFiller relies on components announcing themselves rather than
 * being discovered after the fact.
 *
 * Fully uncontrolled-friendly: if you don't pass `value`/`onChangeText`,
 * `FFTextInput` manages its own state internally.
 */
export const FFTextInput = React.forwardRef<TextInput, FFTextInputProps>(function FFTextInput(
  { fakeFillerType, fakeFillerKey, name, label, value, onChangeText, ...rest },
  ref
) {
  const [internalValue, setInternalValue] = useState(value ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const keyRef = useRef(
    fakeFillerKey ?? rest.testID ?? name ?? rest.placeholder ?? `field_${Math.random().toString(36).slice(2)}`
  );

  const setValue = useCallback(
    (v: string) => {
      if (!isControlled) setInternalValue(v);
      onChangeText?.(v);
    },
    [isControlled, onChangeText]
  );

  const signature: FieldSignature = {
    placeholder: rest.placeholder,
    label,
    accessibilityLabel: rest.accessibilityLabel,
    testID: rest.testID,
    name,
    fakeFillerType,
    secureTextEntry: rest.secureTextEntry,
    keyboardType: rest.keyboardType as string | undefined,
    maxLength: rest.maxLength,
  };

  useRegisterField(keyRef.current, setValue, signature, fakeFillerType);

  return (
    <TextInput
      ref={ref}
      {...rest}
      value={currentValue}
      onChangeText={setValue}
    />
  );
});
