import type { PRNG } from './prng';
import type { ControlKind, FieldSignature, FillValue, GeneratorContext } from './types';

/**
 * Generates values for non-text controls (switch, checkbox, picker, radio, date).
 */
export function generateControlValue(
  kind: ControlKind,
  prng: PRNG,
  signature?: FieldSignature,
  ctx?: GeneratorContext
): FillValue {
  switch (kind) {
    case 'switch':
    case 'checkbox':
      return prng.bool(0.7);

    case 'picker':
    case 'radio': {
      const options = signature?.options ?? ctx?.meta?.options;
      if (options && options.length > 0) {
        return prng.pick(options);
      }
      return prng.pick(['Option A', 'Option B', 'Option C']);
    }

    case 'date': {
      const d = new Date();
      d.setFullYear(d.getFullYear() - prng.int(18, 60));
      d.setMonth(prng.int(0, 11));
      d.setDate(prng.int(1, 28));
      return d;
    }

    case 'text':
    default:
      return '';
  }
}

/** Detects control kind from signature when not explicitly set. */
export function detectControlKind(signature: FieldSignature): ControlKind {
  if (signature.controlKind) return signature.controlKind;
  const type = (signature.fakeFillerType ?? '').toLowerCase();
  if (type === 'switch' || type === 'boolean') return 'switch';
  if (type === 'checkbox') return 'checkbox';
  if (type === 'picker' || type === 'select') return 'picker';
  if (type === 'radio') return 'radio';
  if (type === 'date' || type === 'datepicker' || type === 'dateOfBirth') return 'date';

  const hay = [
    signature.label,
    signature.placeholder,
    signature.accessibilityLabel,
    signature.name,
    signature.testID,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (/\b(switch|toggle)\b/.test(hay)) return 'switch';
  if (/\bcheckbox\b/.test(hay) || /\bagree\b/.test(hay) || /\bterms\b/.test(hay)) return 'checkbox';
  if (/\bpicker\b/.test(hay) || /\bselect\b/.test(hay) || /\bdropdown\b/.test(hay)) return 'picker';
  if (/\bradio\b/.test(hay)) return 'radio';
  if (/\bdate\b/.test(hay) || /\bdob\b/.test(hay)) return 'date';

  return 'text';
}

export function isNonTextKind(kind: ControlKind): boolean {
  return kind !== 'text';
}
