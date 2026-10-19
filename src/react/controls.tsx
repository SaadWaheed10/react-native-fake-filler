import React, { useCallback, useRef, useState } from 'react';
import {
  Switch,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import type { SwitchProps, TextStyle, ViewStyle } from 'react-native';
import { useRegisterField } from './context';
import type { ControlKind, FieldSignature, FillValue } from '../core/types';

function useControlKey(fakeFillerKey?: string, testID?: string, label?: string, name?: string) {
  return useRef(
    fakeFillerKey ?? testID ?? name ?? label ?? `ctrl_${Math.random().toString(36).slice(2)}`
  ).current;
}

function useControlRegistration(
  key: string,
  setValue: (v: FillValue) => void,
  signature: FieldSignature,
  type?: string
) {
  useRegisterField(key, setValue, signature, type);
}

// ---- Switch ---------------------------------------------------------------

export interface FFSwitchProps extends Omit<SwitchProps, 'value' | 'onValueChange'> {
  fakeFillerType?: string;
  fakeFillerKey?: string;
  label?: string;
  name?: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  testID?: string;
}

export function FFSwitch({
  fakeFillerType = 'switch',
  fakeFillerKey,
  label,
  name,
  value,
  onValueChange,
  testID,
  ...rest
}: FFSwitchProps) {
  const [internal, setInternal] = useState(value ?? false);
  const isControlled = value !== undefined;
  const current = isControlled ? (value as boolean) : internal;
  const key = useControlKey(fakeFillerKey, testID, label, name);

  const setValue = useCallback(
    (v: FillValue) => {
      const bool = typeof v === 'boolean' ? v : String(v) === 'true';
      if (!isControlled) setInternal(bool);
      onValueChange?.(bool);
    },
    [isControlled, onValueChange]
  );

  const signature: FieldSignature = {
    label,
    accessibilityLabel: rest.accessibilityLabel,
    testID,
    name,
    fakeFillerType,
    controlKind: 'switch',
  };

  useControlRegistration(key, setValue, signature, fakeFillerType);

  return (
    <Switch
      {...rest}
      testID={testID}
      value={current}
      onValueChange={(v) => setValue(v)}
    />
  );
}

// ---- Checkbox -------------------------------------------------------------

export interface FFCheckboxProps {
  fakeFillerType?: string;
  fakeFillerKey?: string;
  label?: string;
  name?: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  testID?: string;
  accessibilityLabel?: string;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export function FFCheckbox({
  fakeFillerType = 'checkbox',
  fakeFillerKey,
  label,
  name,
  value,
  onValueChange,
  testID,
  accessibilityLabel,
  style,
  labelStyle,
}: FFCheckboxProps) {
  const [internal, setInternal] = useState(value ?? false);
  const isControlled = value !== undefined;
  const current = isControlled ? (value as boolean) : internal;
  const key = useControlKey(fakeFillerKey, testID, label, name);

  const setValue = useCallback(
    (v: FillValue) => {
      const bool = typeof v === 'boolean' ? v : String(v) === 'true';
      if (!isControlled) setInternal(bool);
      onValueChange?.(bool);
    },
    [isControlled, onValueChange]
  );

  const signature: FieldSignature = {
    label,
    accessibilityLabel,
    testID,
    name,
    fakeFillerType,
    controlKind: 'checkbox',
  };

  useControlRegistration(key, setValue, signature, fakeFillerType);

  return (
    <TouchableOpacity
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: current }}
      style={[styles.row, style]}
      onPress={() => setValue(!current)}
    >
      <View style={[styles.box, current && styles.boxChecked]}>
        {current ? <Text style={styles.check}>✓</Text> : null}
      </View>
      {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}
    </TouchableOpacity>
  );
}

// ---- Picker (simple option list) ------------------------------------------

export interface FFPickerProps {
  fakeFillerType?: string;
  fakeFillerKey?: string;
  label?: string;
  name?: string;
  options: Array<string | number>;
  value?: string | number;
  onValueChange?: (value: string | number) => void;
  testID?: string;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export function FFPicker({
  fakeFillerType = 'picker',
  fakeFillerKey,
  label,
  name,
  options,
  value,
  onValueChange,
  testID,
  accessibilityLabel,
  style,
}: FFPickerProps) {
  const [internal, setInternal] = useState<string | number>(value ?? options[0] ?? '');
  const isControlled = value !== undefined;
  const current = isControlled ? (value as string | number) : internal;
  const key = useControlKey(fakeFillerKey, testID, label, name);

  const setValue = useCallback(
    (v: FillValue) => {
      const next = typeof v === 'number' ? v : String(v);
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );

  const signature: FieldSignature = {
    label,
    accessibilityLabel,
    testID,
    name,
    fakeFillerType,
    controlKind: 'picker',
    options,
  };

  useControlRegistration(key, setValue, signature, fakeFillerType);

  return (
    <View style={style} testID={testID} accessibilityLabel={accessibilityLabel ?? label}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.optionRow}>
        {options.map((opt) => {
          const selected = String(opt) === String(current);
          return (
            <TouchableOpacity
              key={String(opt)}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => setValue(opt)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{String(opt)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ---- Radio ----------------------------------------------------------------

export interface FFRadioProps {
  fakeFillerType?: string;
  fakeFillerKey?: string;
  label?: string;
  name?: string;
  options: Array<string | number>;
  value?: string | number;
  onValueChange?: (value: string | number) => void;
  testID?: string;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export function FFRadio({
  fakeFillerType = 'radio',
  fakeFillerKey,
  label,
  name,
  options,
  value,
  onValueChange,
  testID,
  accessibilityLabel,
  style,
}: FFRadioProps) {
  const [internal, setInternal] = useState<string | number>(value ?? options[0] ?? '');
  const isControlled = value !== undefined;
  const current = isControlled ? (value as string | number) : internal;
  const key = useControlKey(fakeFillerKey, testID, label, name);

  const setValue = useCallback(
    (v: FillValue) => {
      const next = typeof v === 'number' ? v : String(v);
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );

  const signature: FieldSignature = {
    label,
    accessibilityLabel,
    testID,
    name,
    fakeFillerType,
    controlKind: 'radio',
    options,
  };

  useControlRegistration(key, setValue, signature, fakeFillerType);

  return (
    <View style={style} testID={testID} accessibilityLabel={accessibilityLabel ?? label}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {options.map((opt) => {
        const selected = String(opt) === String(current);
        return (
          <TouchableOpacity
            key={String(opt)}
            style={styles.row}
            onPress={() => setValue(opt)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
              {selected ? <View style={styles.radioInner} /> : null}
            </View>
            <Text style={styles.label}>{String(opt)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ---- Date (ISO string / Date) ---------------------------------------------

export interface FFDateProps {
  fakeFillerType?: string;
  fakeFillerKey?: string;
  label?: string;
  name?: string;
  value?: Date | string;
  onValueChange?: (value: Date) => void;
  testID?: string;
  accessibilityLabel?: string;
  style?: ViewStyle;
  /** Format shown in the control (default YYYY-MM-DD) */
  displayFormat?: 'iso' | 'locale';
}

export function FFDate({
  fakeFillerType = 'date',
  fakeFillerKey,
  label,
  name,
  value,
  onValueChange,
  testID,
  accessibilityLabel,
  style,
  displayFormat = 'iso',
}: FFDateProps) {
  const toDate = (v: Date | string | undefined) => {
    if (!v) return new Date();
    return v instanceof Date ? v : new Date(v);
  };
  const [internal, setInternal] = useState<Date>(toDate(value));
  const isControlled = value !== undefined;
  const current = isControlled ? toDate(value) : internal;
  const key = useControlKey(fakeFillerKey, testID, label, name);

  const setValue = useCallback(
    (v: FillValue) => {
      const next =
        v instanceof Date ? v : typeof v === 'string' || typeof v === 'number' ? new Date(v) : new Date();
      if (Number.isNaN(next.getTime())) return;
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );

  const signature: FieldSignature = {
    label,
    accessibilityLabel,
    testID,
    name,
    fakeFillerType,
    controlKind: 'date',
  };

  useControlRegistration(key, setValue, signature, fakeFillerType);

  const display =
    displayFormat === 'locale'
      ? current.toLocaleDateString()
      : current.toISOString().slice(0, 10);

  return (
    <TouchableOpacity
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? label ?? 'Date'}
      style={[styles.dateBox, style]}
      onPress={() => {
        // Cycle by -1 year as a simple interaction without native date picker dependency
        const next = new Date(current);
        next.setFullYear(next.getFullYear() - 1);
        setValue(next);
      }}
    >
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Text style={styles.dateText}>{display}</Text>
      <Text style={styles.hint}>Tap to shift · FakeFiller fills automatically</Text>
    </TouchableOpacity>
  );
}

/** Low-level helper to register any custom control with a ControlKind. */
export function useRegisterControl(
  key: string,
  setValue: (value: FillValue) => void,
  signature: FieldSignature & { controlKind: ControlKind },
  type?: string
): void {
  useRegisterField(key, setValue, signature, type ?? signature.controlKind);
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  box: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#374151',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  boxChecked: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  check: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    color: '#111827',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  chipSelected: {
    backgroundColor: '#111827',
  },
  chipText: {
    color: '#111827',
    fontSize: 13,
  },
  chipTextSelected: {
    color: '#f9fafb',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioOuterSelected: {
    borderColor: '#111827',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#111827',
  },
  dateBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: Platform.OS === 'ios' ? '#fff' : '#f9fafb',
  },
  dateText: {
    fontSize: 16,
    color: '#111827',
    marginTop: 4,
  },
  hint: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
});
