/**
 * Auth-flow helpers that aren't TextInputs: OTP codes, biometric stubs,
 * and deep-link verification URLs.
 */

export interface OtpOptions {
  /** Digit length (default 6) */
  length?: number;
  /** Fixed seed for deterministic OTPs in tests */
  seed?: number;
}

/** Generates a numeric OTP / SMS code. */
export function generateOtp(options: OtpOptions = {}): string {
  const length = options.length ?? 6;
  let state = (options.seed ?? Date.now()) >>> 0;
  let out = '';
  for (let i = 0; i < length; i++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    out += String(state % 10);
  }
  return out;
}

export type BiometricResult = 'success' | 'fail' | 'cancel' | 'unavailable';

let biometricStub: BiometricResult = 'success';
let biometricHandler: ((result: BiometricResult) => void) | null = null;

/** Force the next biometric prompt result (dev/test only). */
export function stubBiometric(result: BiometricResult): void {
  biometricStub = result;
}

/** Read the current biometric stub without consuming it. */
export function getBiometricStub(): BiometricResult {
  return biometricStub;
}

/**
 * Simulates a biometric prompt. Resolves with the stubbed result after a short delay.
 * Wire this into your app's biometric gate in __DEV__.
 */
export function promptBiometric(delayMs = 200): Promise<BiometricResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = biometricStub;
      biometricHandler?.(result);
      resolve(result);
    }, delayMs);
  });
}

export function onBiometricResult(handler: (result: BiometricResult) => void): () => void {
  biometricHandler = handler;
  return () => {
    if (biometricHandler === handler) biometricHandler = null;
  };
}

export interface DeepLinkOptions {
  scheme?: string;
  host?: string;
  path?: string;
  token?: string;
  params?: Record<string, string>;
}

/**
 * Builds a verification / magic-link URL for deep-link testing.
 * Does not open it — call `openDeepLink` or Linking.openURL yourself.
 */
export function buildDeepLink(options: DeepLinkOptions = {}): string {
  const scheme = options.scheme ?? 'myapp';
  const host = options.host ?? 'verify';
  const path = options.path ?? '';
  const params = new URLSearchParams({
    ...(options.token ? { token: options.token } : {}),
    ...options.params,
  });
  const qs = params.toString();
  const base = `${scheme}://${host}${path ? `/${path.replace(/^\//, '')}` : ''}`;
  return qs ? `${base}?${qs}` : base;
}

/**
 * Opens a deep link via React Native Linking when available.
 */
export async function openDeepLink(urlOrOptions: string | DeepLinkOptions): Promise<boolean> {
  const url = typeof urlOrOptions === 'string' ? urlOrOptions : buildDeepLink(urlOrOptions);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Linking } = require('react-native');
    const can = await Linking.canOpenURL(url);
    if (!can) {
      // Still attempt — custom schemes sometimes report false in simulators
    }
    await Linking.openURL(url);
    return true;
  } catch {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      // eslint-disable-next-line no-console
      console.info('[FakeFiller] openDeepLink failed for', url);
    }
    return false;
  }
}

/** Convenience pack for an auth verify screen. */
export function authFixture(options: { scheme?: string; otpLength?: number } = {}) {
  const otp = generateOtp({ length: options.otpLength });
  const token = `tok_${Date.now().toString(36)}_${otp}`;
  const deepLink = buildDeepLink({
    scheme: options.scheme,
    token,
    params: { otp },
  });
  return { otp, token, deepLink, biometric: biometricStub };
}
