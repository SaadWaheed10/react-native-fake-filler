import { fakeFillerEngine } from '../core/FakeFiller';
import { detectFieldType } from '../core/fieldDetector';
import type { FieldSignature, FillOptions, FillResult, FillValue } from '../core/types';

export interface FormikLike {
  setFieldValue: (field: string, value: FillValue, shouldValidate?: boolean) => void | Promise<void>;
  setValues?: (values: Record<string, FillValue>, shouldValidate?: boolean) => void | Promise<void>;
  validateForm?: () => void | Promise<unknown>;
  values?: Record<string, unknown>;
}

export interface FillFormikOptions extends FillOptions {
  fields?: Record<string, FieldSignature | string>;
  shouldValidate?: boolean;
}

/**
 * Fills a Formik form via `setFieldValue`.
 *
 * @example
 * ```ts
 * FakeFiller.fillFormik(formik, {
 *   fields: { email: 'email', password: 'password' },
 * });
 * ```
 */
export function fillFormik(formik: FormikLike, options: FillFormikOptions = {}): FillResult {
  const fieldMap = options.fields ?? {};
  const names = Object.keys(fieldMap).length
    ? Object.keys(fieldMap)
    : Object.keys(formik.values ?? {});

  const targets: Record<string, { setValue: (v: FillValue) => void; signature?: FieldSignature }> = {};

  const list = names.length
    ? names
    : ['email', 'password', 'firstName', 'lastName', 'username', 'mobileNumber'];

  for (const name of list) {
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
        void formik.setFieldValue(name, v, options.shouldValidate ?? true);
      },
    };
  }

  const result = fakeFillerEngine.fill(targets, options);
  if (options.shouldValidate !== false && formik.validateForm) {
    void formik.validateForm();
  }
  return result;
}
