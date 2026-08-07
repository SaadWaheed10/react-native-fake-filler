import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useFakeFiller } from './useFakeFiller';

export interface FakeFillerDevToolbarProps {
  /** Forces visibility regardless of `__DEV__`. Use with care — don't ship this true in production. */
  visible?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  onExport?: (values: Record<string, string>) => void;
}

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

/**
 * An optional floating "⚡ Fill Form" button for manual testing. Renders
 * nothing outside development by default. Must be placed inside a
 * `FakeFillerProvider` to have any effect.
 */
export function FakeFillerDevToolbar({
  visible,
  position = 'bottom-right',
  onExport,
}: FakeFillerDevToolbarProps) {
  const { fill, clear, regenerate } = useFakeFiller();
  const [expanded, setExpanded] = useState(false);

  const shouldRender = visible ?? isDev;
  if (!shouldRender) return null;

  const positionStyle = POSITION_STYLES[position];

  return (
    <View style={[styles.container, positionStyle]} pointerEvents="box-none">
      {expanded && (
        <View style={styles.menu}>
          <ToolbarButton label="Fill Form" onPress={() => fill()} />
          <ToolbarButton label="Regenerate" onPress={() => regenerate()} />
          <ToolbarButton label="Clear Form" onPress={() => clear()} />
          <ToolbarButton
            label="Export"
            onPress={() => {
              const values: Record<string, string> = {};
              onExport?.(values);
              Alert.alert('FakeFiller', 'Export hook fired — wire `onExport` to persist values.');
            }}
          />
        </View>
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setExpanded((e) => !e)}
        accessibilityLabel="FakeFiller developer toolbar"
      >
        <Text style={styles.fabText}>⚡</Text>
      </TouchableOpacity>
    </View>
  );
}

function ToolbarButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuItemText}>{label}</Text>
    </TouchableOpacity>
  );
}

const POSITION_STYLES = StyleSheet.create({
  'bottom-right': { bottom: 24, right: 16 },
  'bottom-left': { bottom: 24, left: 16 },
  'top-right': { top: 48, right: 16 },
  'top-left': { top: 48, left: 16 },
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'flex-end',
    zIndex: 9999,
    elevation: 9999,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 6 },
    }),
  },
  fabText: {
    fontSize: 22,
  },
  menu: {
    marginBottom: 8,
    backgroundColor: '#1f2937',
    borderRadius: 10,
    paddingVertical: 4,
    minWidth: 150,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  menuItemText: {
    color: '#f9fafb',
    fontSize: 14,
    fontWeight: '500',
  },
});
