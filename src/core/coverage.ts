import { detectFieldType } from './fieldDetector';
import { detectControlKind } from './controls';
import type { RegisteredField } from './types';

export interface FieldCoverageEntry {
  key: string;
  detectedType: string | undefined;
  controlKind: string;
  placeholder?: string;
  label?: string;
  testID?: string;
  status: 'detected' | 'skipped';
}

export interface CoverageReport {
  total: number;
  detected: number;
  skipped: number;
  coveragePercent: number;
  fields: FieldCoverageEntry[];
}

/**
 * Builds a detection coverage report for currently registered fields —
 * shows which fields FakeFiller understands vs which it would skip.
 */
export function buildCoverageReport(fields: RegisteredField[]): CoverageReport {
  const entries: FieldCoverageEntry[] = fields.map((field) => {
    const kind = detectControlKind(field.signature);
    const type = field.type ?? detectFieldType(field.signature) ?? (kind !== 'text' ? kind : undefined);
    return {
      key: field.key,
      detectedType: type,
      controlKind: kind,
      placeholder: field.signature.placeholder,
      label: field.signature.label,
      testID: field.signature.testID,
      status: type ? 'detected' : 'skipped',
    };
  });

  const detected = entries.filter((e) => e.status === 'detected').length;
  const skipped = entries.length - detected;
  const coveragePercent =
    entries.length === 0 ? 100 : Math.round((detected / entries.length) * 100);

  return {
    total: entries.length,
    detected,
    skipped,
    coveragePercent,
    fields: entries,
  };
}
