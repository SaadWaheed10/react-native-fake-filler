import { fakeFillerEngine } from '../core/FakeFiller';
import { detectFieldType } from '../core/fieldDetector';
import type { FieldSignature, FillOptions, FillResult, FillValue } from '../core/types';

/**
 * Minimal shape of React Hook Form's `UseFormSetValue` / `UseFormReturn`.
 * We duck-type so react-hook-form stays an optional peer.
 */
export interface RHFLike {
  setValue: (name: string, value: FillValue, opts?: { shouldDirty?: boolean; shouldValidate?: boolean }) => void;
  trigger?: (name?: string | string[]) => Promise<boolean> | boolean;
  getValues?: () => Record<string, unknown>;
}

export interface FillRHFOptions extends FillOptions {
  /** Field name → signature for detection (optional if names are FieldKeys) */
  fields?: Record<string, FieldSignature | string>;
  /** Trigger validation after fill (default true) */
  shouldValidate?: boolean;
}

/**
 * Fills a React Hook Form instance by calling `setValue` for each field.
 *
 * @example
 * ```ts
 * const { setValue, trigger } = useForm();
 * FakeFiller.fillReactHookForm({ setValue, trigger }, {
 *   fields: { email: { placeholder: 'Email' }, password: 'password' },
 * });
 * ```
 */
export function fillReactHookForm(form: RHFLike, options: FillRHFOptions = {}): FillResult {
  const fieldMap = options.fields ?? {};
  const names = Object.keys(fieldMap).length
    ? Object.keys(fieldMap)
    : Object.keys(form.getValues?.() ?? {});

  const targets: Record<string, { setValue: (v: FillValue) => void; signature?: FieldSignature }> = {};

  for (const name of names) {
    const spec = fieldMap[name];
    const signature: FieldSignature | undefined =
      typeof spec === 'string'
        ? { fakeFillerType: spec, name }
        : spec
          ? { ...spec, name: spec.name ?? name }
          : { name };

    const type = signature ? detectFieldType(signature) ?? signature.fakeFillerType ?? name : name;

    targets[type] = {
      signature,
      setValue: (v) => {
        form.setValue(name, v, {
          shouldDirty: true,
          shouldValidate: options.shouldValidate ?? true,
        });
      },
    };
  }

  // If no fields provided, fill common auth keys onto matching RHF names
  if (names.length === 0) {
    for (const type of ['email', 'password', 'firstName', 'lastName', 'username', 'mobileNumber']) {
      targets[type] = {
        setValue: (v) => {
          form.setValue(type, v, { shouldDirty: true, shouldValidate: options.shouldValidate ?? true });
        },
      };
    }
  }

  const result = fakeFillerEngine.fill(targets, options);
  if (options.shouldValidate !== false && form.trigger) {
    void form.trigger();
  }
  return result;
}
