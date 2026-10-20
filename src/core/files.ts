/**
 * Fake file / image / document assets for upload-field testing.
 * Pure data URIs and in-memory descriptors — no native modules required.
 * Optionally write to disk when expo-file-system is installed.
 */

export type FakeFileKind = 'avatar' | 'id-scan' | 'receipt' | 'pdf' | 'document' | 'image';

export interface FakeFile {
  kind: FakeFileKind;
  /** Suggested filename */
  name: string;
  /** MIME type */
  mimeType: string;
  /** data: URI usable by Image / FormData in many RN setups */
  uri: string;
  /** Byte length estimate */
  size: number;
  /** Base64 payload without data: prefix (for FormData append) */
  base64: string;
}

/** 1x1 PNG (red pixel) — tiny but valid image for avatar / photo uploads */
const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

/** Minimal valid PDF header as base64 */
const TINY_PDF_BASE64 =
  'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1szIDAgUl0+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdPj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDc0IDAwMDAwIG4gCjAwMDAwMDAxMjAgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDQvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoxOTMKJSVFT0YK';

const SPECS: Record<FakeFileKind, { name: string; mimeType: string; base64: string }> = {
  avatar: { name: 'avatar.png', mimeType: 'image/png', base64: TINY_PNG_BASE64 },
  'id-scan': { name: 'id-scan.png', mimeType: 'image/png', base64: TINY_PNG_BASE64 },
  receipt: { name: 'receipt.png', mimeType: 'image/png', base64: TINY_PNG_BASE64 },
  image: { name: 'photo.png', mimeType: 'image/png', base64: TINY_PNG_BASE64 },
  pdf: { name: 'document.pdf', mimeType: 'application/pdf', base64: TINY_PDF_BASE64 },
  document: { name: 'notes.txt', mimeType: 'text/plain', base64: btoaSafe('FakeFiller test document') },
};

function btoaSafe(text: string): string {
  if (typeof globalThis.btoa === 'function') return globalThis.btoa(text);
  // Minimal ascii→base64 for RN without btoa
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  const bytes = Array.from(text).map((c) => c.charCodeAt(0));
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i] ?? 0;
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    out += chars[a >> 2];
    out += chars[((a & 3) << 4) | ((b ?? 0) >> 4)];
    out += b === undefined ? '=' : chars[(((b as number) & 15) << 2) | ((c ?? 0) >> 6)];
    out += c === undefined ? '=' : chars[(c as number) & 63];
  }
  return out;
}

export function createFakeFile(kind: FakeFileKind = 'avatar'): FakeFile {
  const spec = SPECS[kind];
  const uri = `data:${spec.mimeType};base64,${spec.base64}`;
  return {
    kind,
    name: `ff_${Date.now()}_${spec.name}`,
    mimeType: spec.mimeType,
    uri,
    size: Math.ceil((spec.base64.length * 3) / 4),
    base64: spec.base64,
  };
}

export function createFakeFiles(kinds: FakeFileKind[]): FakeFile[] {
  return kinds.map((k) => createFakeFile(k));
}

/**
 * Attempts to write the fake file to the cache directory when `expo-file-system`
 * is installed. Returns the original data URI file if unavailable.
 */
export async function materializeFakeFile(kind: FakeFileKind = 'avatar'): Promise<FakeFile & { path?: string }> {
  const file = createFakeFile(kind);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const FileSystem = require('expo-file-system');
    const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
    if (!dir) return file;
    const path = `${dir}${file.name}`;
    await FileSystem.writeAsStringAsync(path, file.base64, {
      encoding: FileSystem.EncodingType?.Base64 ?? 'base64',
    });
    return { ...file, uri: path, path };
  } catch {
    return file;
  }
}
