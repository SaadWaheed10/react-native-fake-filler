import { fakeFillerEngine } from '../core/FakeFiller';
import { detectFieldType } from '../core/fieldDetector';
import type { FieldSignature, FillOptions, FillResult, FillValue } from '../core/types';

export interface FinalFormLike {
  change: (name: string, value: FillValue) => void;
  batch?: (fn: () => void) => void;
  getState?: () => { values: Record<string, unknown> };
}

export interface FillFinalFormOptions extends FillOptions {
  fields?: Record<string, FieldSignature | string>;
}

/**
 * Fills a React Final Form instance via `form.change`.
 *
 * @example
 * ```ts
 * FakeFiller.fillFinalForm(form, {
 *   fields: { email: 'email', password: 'password' },
 * });
 * ```
 */
export function fillFinalForm(form: FinalFormLike, options: FillFinalFormOptions = {}): FillResult {
  const fieldMap = options.fields ?? {};
  const names = Object.keys(fieldMap).length
    ? Object.keys(fieldMap)
    : Object.keys(form.getState?.().values ?? {});

  const list = names.length
    ? names
    : ['email', 'password', 'firstName', 'lastName', 'username', 'mobileNumber'];

  const targets: Record<string, { setValue: (v: FillValue) => void; signature?: FieldSignature }> = {};

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
      setValue: (v) => form.change(name, v),
    };
  }

  const run = () => fakeFillerEngine.fill(targets, options);
  if (form.batch) {
    let result: FillResult = { filled: 0, skipped: 0, values: {} };
    form.batch(() => {
      result = run();
    });
    return result;
  }
  return run();
}
