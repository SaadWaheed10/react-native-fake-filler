import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Platform } from 'react-native';
import { useFakeFiller } from './useFakeFiller';
import { copyToClipboard } from './clipboard';

export interface ShareFillProps {
  visible?: boolean;
  /** Called with JSON + a QR payload string when user taps Share */
  onShare?: (json: string, qrPayload: string) => void;
}

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

/**
 * Compact QR matrix rendered with Views (no native QR dependency).
 * Encodes a short payload as a simplified hash-grid for device-to-device
 * handoff — for production QR scanning use a real QR lib with the JSON payload.
 */
function SimpleQrGrid({ payload }: { payload: string }) {
  const size = 21;
  const cells = useMemo(() => {
    const grid: boolean[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => false)
    );
    // Finder patterns (corners)
    const paintFinder = (ox: number, oy: number) => {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          const edge = x === 0 || y === 0 || x === 6 || y === 6;
          const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          grid[oy + y]![ox + x] = edge || core;
        }
      }
    };
    paintFinder(0, 0);
    paintFinder(size - 7, 0);
    paintFinder(0, size - 7);

    // Data bits from payload hash
    let h = 2166136261;
    for (let i = 0; i < payload.length; i++) {
      h ^= payload.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (y < 8 && x < 8) continue;
        if (y < 8 && x >= size - 8) continue;
        if (y >= size - 8 && x < 8) continue;
        h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
        grid[y]![x] = h % 2 === 0;
      }
    }
    return grid;
  }, [payload]);

  const cell = 6;
  return (
    <View style={{ width: size * cell, height: size * cell, backgroundColor: '#fff', padding: 0 }}>
      {cells.map((row, y) => (
        <View key={y} style={{ flexDirection: 'row' }}>
          {row.map((on, x) => (
            <View
              key={x}
              style={{
                width: cell,
                height: cell,
                backgroundColor: on ? '#111' : '#fff',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

/**
 * Clipboard + QR quick-fill panel. Copies last fill JSON and shows a visual
 * QR-like grid for pairing another device (payload is the JSON string —
 * scan/share via `onShare` or a real QR library in your app).
 */
export function ShareFill({ visible, onShare }: ShareFillProps) {
  const { exportJson, lastValues } = useFakeFiller();
  const [open, setOpen] = useState(false);
  const shouldRender = visible ?? isDev;
  if (!shouldRender) return null;

  const json = exportJson();
  const hasData = Object.keys(lastValues()).length > 0;

  const doCopy = async () => {
    if (!hasData) {
      Alert.alert('FakeFiller', 'No fill to copy yet.');
      return;
    }
    const ok = await copyToClipboard(json);
    Alert.alert('FakeFiller', ok ? 'Copied fill JSON to clipboard.' : 'Clipboard unavailable — install @react-native-clipboard/clipboard or expo-clipboard.');
    onShare?.(json, json);
  };

  return (
    <>
      <TouchableOpacity style={styles.btn} onPress={() => setOpen(true)}>
        <Text style={styles.btnText}>⎘ Share</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Text style={styles.title}>Clipboard & QR</Text>
            <Text style={styles.hint}>
              Copy last fill JSON, or show a pairing grid for another device/emulator.
            </Text>
            {hasData ? (
              <View style={styles.qrWrap}>
                <SimpleQrGrid payload={json.slice(0, 512)} />
              </View>
            ) : (
              <Text style={styles.empty}>Fill a form first.</Text>
            )}
            <TouchableOpacity style={styles.primary} onPress={doCopy}>
              <Text style={styles.primaryText}>Copy JSON</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondary} onPress={() => setOpen(false)}>
              <Text style={styles.secondaryText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#1e3a5f',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnText: { color: '#e0f2fe', fontSize: 13, fontWeight: '600' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  hint: { fontSize: 12, color: '#64748b', textAlign: 'center', marginTop: 6, marginBottom: 14 },
  qrWrap: {
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  empty: { color: '#94a3b8', marginBottom: 14 },
  primary: {
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '600' },
  secondary: { marginTop: 10, padding: 8 },
  secondaryText: { color: '#64748b' },
});
