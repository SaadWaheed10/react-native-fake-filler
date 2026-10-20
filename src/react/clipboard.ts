/**
 * Optional Clipboard bridge — uses @react-native-clipboard/clipboard or
 * expo-clipboard when available.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const clip = require('@react-native-clipboard/clipboard');
    const Clipboard = clip.default ?? clip;
    Clipboard.setString(text);
    return true;
  } catch {
    // try expo
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const expoClip = require('expo-clipboard');
    await expoClip.setStringAsync(text);
    return true;
  } catch {
    return false;
  }
}
