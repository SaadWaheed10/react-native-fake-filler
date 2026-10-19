import type { FieldMeta, FieldSignature, FillValue } from './types';

/**
 * Applies length / pattern constraints so generated values are less likely
 * to fail client-side validation. Works best when the field signature
 * exposes `maxLength`, `minLength`, or `pattern`.
 */
export function applyValidation(
  value: FillValue,
  signature?: FieldSignature,
  meta?: FieldMeta
): FillValue {
  if (typeof value !== 'string') return value;

  const maxLength = meta?.maxLength ?? signature?.maxLength;
  const minLength = meta?.minLength ?? signature?.minLength;
  const patternSrc = meta?.pattern ?? signature?.pattern;
  const pattern =
    patternSrc instanceof RegExp
      ? patternSrc
      : typeof patternSrc === 'string' && patternSrc.length > 0
        ? safeRegExp(patternSrc)
        : undefined;

  let result = value;

  if (typeof maxLength === 'number' && maxLength > 0 && result.length > maxLength) {
    result = result.slice(0, maxLength);
  }

  if (typeof minLength === 'number' && minLength > 0 && result.length < minLength) {
    result = padToMinLength(result, minLength);
  }

  if (pattern && !pattern.test(result)) {
    const coerced = coerceToPattern(result, pattern, maxLength, minLength);
    if (coerced !== null) result = coerced;
  }

  return result;
}

function safeRegExp(source: string): RegExp | undefined {
  try {
    return new RegExp(source);
  } catch {
    return undefined;
  }
}

function padToMinLength(value: string, minLength: number): string {
  if (/^\d+$/.test(value)) {
    return value.padEnd(minLength, '0');
  }
  return value.padEnd(minLength, 'x');
}

/**
 * Best-effort coercion for a few common patterns (digits-only, email-ish,
 * alphanumeric). Returns null when the pattern is too complex to satisfy.
 */
function coerceToPattern(
  value: string,
  pattern: RegExp,
  maxLength?: number,
  minLength?: number
): string | null {
  const source = pattern.source;

  if (source.includes('@') || /email/i.test(source)) {
    const email = value.includes('@') ? value : `${value.replace(/\W/g, '') || 'user'}@example.com`;
    return trimLengths(email, maxLength, minLength);
  }

  if (/^\\d\+?\$?$/.test(source) || source === '\\d+' || source.includes('\\d')) {
    const digits = value.replace(/\D/g, '') || '1';
    return trimLengths(digits, maxLength, minLength);
  }

  if (source.includes('[A-Za-z0-9') || source.includes('\\w')) {
    const alnum = value.replace(/[^A-Za-z0-9]/g, '') || 'x';
    return trimLengths(alnum, maxLength, minLength);
  }

  // Last resort: if truncated/padded value happens to match, use it
  const trimmed = trimLengths(value, maxLength, minLength);
  return pattern.test(trimmed) ? trimmed : null;
}

function trimLengths(value: string, maxLength?: number, minLength?: number): string {
  let result = value;
  if (typeof maxLength === 'number' && maxLength > 0 && result.length > maxLength) {
    result = result.slice(0, maxLength);
  }
  if (typeof minLength === 'number' && minLength > 0 && result.length < minLength) {
    result = padToMinLength(result, minLength);
  }
  return result;
}

/** Builds FieldMeta from a signature so generators can honour constraints. */
export function metaFromSignature(signature?: FieldSignature): FieldMeta | undefined {
  if (!signature) return undefined;
  const meta: FieldMeta = {};
  if (signature.maxLength != null) meta.maxLength = signature.maxLength;
  if (signature.minLength != null) meta.minLength = signature.minLength;
  if (signature.pattern != null) {
    meta.pattern =
      signature.pattern instanceof RegExp
        ? signature.pattern
        : safeRegExp(signature.pattern);
  }
  if (signature.options) meta.options = signature.options;
  return Object.keys(meta).length ? meta : undefined;
}
