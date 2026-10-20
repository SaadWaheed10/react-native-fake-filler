import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useFakeFillerContext } from './context';
import { buildCoverageReport } from '../core/coverage';

export interface CoverageOverlayProps {
  visible?: boolean;
  position?: 'top' | 'bottom';
}

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

/**
 * Dev overlay showing which registered fields FakeFiller detected vs skipped,
 * plus a coverage percentage.
 */
export function CoverageOverlay({ visible, position = 'top' }: CoverageOverlayProps) {
  const ctx = useFakeFillerContext();
  const [open, setOpen] = useState(false);
  const fieldCount = ctx?.fieldCount() ?? 0;

  const report = useMemo(() => {
    if (!open || !ctx) return null;
    return buildCoverageReport(ctx.getRegisteredFields());
  }, [open, ctx, fieldCount]);

  const shouldRender = visible ?? isDev;
  if (!shouldRender || !ctx) return null;

  return (
    <View
      style={[styles.wrap, position === 'top' ? styles.top : styles.bottom]}
      pointerEvents="box-none"
    >
      <TouchableOpacity style={styles.badge} onPress={() => setOpen((o) => !o)}>
        <Text style={styles.badgeText}>
          {open && report ? `${report.coveragePercent}% cov` : 'FF map'}
        </Text>
      </TouchableOpacity>
      {open && report && (
        <View style={styles.panel}>
          <Text style={styles.title}>
            Coverage {report.coveragePercent}% · {report.detected}/{report.total} detected
          </Text>
          <ScrollView style={styles.list} nestedScrollEnabled>
            {report.fields.map((f) => (
              <View key={f.key} style={styles.row}>
                <Text
                  style={[styles.dot, f.status === 'detected' ? styles.ok : styles.skip]}
                >
                  {f.status === 'detected' ? '●' : '○'}
                </Text>
                <View style={styles.meta}>
                  <Text style={styles.key} numberOfLines={1}>
                    {f.label || f.placeholder || f.testID || f.key}
                  </Text>
                  <Text style={styles.type}>
                    {f.detectedType ?? 'skipped'} · {f.controlKind}
                  </Text>
                </View>
              </View>
            ))}
            {report.fields.length === 0 && (
              <Text style={styles.empty}>No fields registered yet.</Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 12, zIndex: 9998, elevation: 9998, maxWidth: '90%' },
  top: { top: Platform.OS === 'ios' ? 52 : 24 },
  bottom: { bottom: 90 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0f766e',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: { color: '#ecfdf5', fontSize: 12, fontWeight: '700' },
  panel: {
    marginTop: 8,
    backgroundColor: '#134e4a',
    borderRadius: 10,
    padding: 10,
    maxHeight: 280,
    minWidth: 220,
  },
  title: { color: '#ccfbf1', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  list: { maxHeight: 220 },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  dot: { width: 16, fontSize: 12, marginTop: 2 },
  ok: { color: '#5eead4' },
  skip: { color: '#fcd34d' },
  meta: { flex: 1 },
  key: { color: '#f0fdfa', fontSize: 12, fontWeight: '500' },
  type: { color: '#99f6e4', fontSize: 10 },
  empty: { color: '#99f6e4', fontSize: 12 },
});
