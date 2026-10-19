import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { useFakeFiller } from './useFakeFiller';
import { fakeFillerEngine } from '../core/FakeFiller';
import type { ScenarioId } from '../core/types';

export interface FakeFillerDevToolbarProps {
  /** Forces visibility regardless of `__DEV__`. Use with care — don't ship this true in production. */
  visible?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  onExport?: (values: Record<string, string>, json: string) => void;
  /** Long-press the FAB to fill (in addition to shake / menu). */
  longPressFills?: boolean;
  /** Default scenario applied when tapping Fill Form */
  defaultScenario?: ScenarioId | string;
}

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

const QUICK_SCENARIOS: Array<{ id: ScenarioId; label: string }> = [
  { id: 'signup', label: 'Signup' },
  { id: 'checkout', label: 'Checkout' },
  { id: 'kyc', label: 'KYC' },
  { id: 'invalid-email', label: 'Bad email' },
  { id: 'edge-case-long-name', label: 'Long name' },
];

/**
 * An optional floating "⚡ Fill Form" button for manual testing. Renders
 * nothing outside development by default. Must be placed inside a
 * `FakeFillerProvider` to have any effect.
 */
export function FakeFillerDevToolbar({
  visible,
  position = 'bottom-right',
  onExport,
  longPressFills = true,
  defaultScenario,
}: FakeFillerDevToolbarProps) {
  const { fill, clear, regenerate, replay, exportJson, lastValues, history } = useFakeFiller();
  const [expanded, setExpanded] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);

  const shouldRender = visible ?? isDev;
  if (!shouldRender) return null;

  const positionStyle = POSITION_STYLES[position];

  const doExport = () => {
    const json = exportJson();
    const values = lastValues();
    const asStrings: Record<string, string> = {};
    for (const [k, v] of Object.entries(values)) {
      asStrings[k] = v instanceof Date ? v.toISOString() : String(v);
    }
    onExport?.(asStrings, json);
    const preview = json.length > 400 ? `${json.slice(0, 400)}…` : json;
    Alert.alert('FakeFiller Export', preview || 'No fill history yet. Fill a form first.');
  };

  const doReplay = () => {
    const snaps = history();
    if (snaps.length === 0) {
      Alert.alert('FakeFiller', 'No fill history to replay.');
      return;
    }
    const result = replay();
    Alert.alert('FakeFiller', `Replayed last fill (${result.filled} fields).`);
  };

  return (
    <View style={[styles.container, positionStyle]} pointerEvents="box-none">
      {expanded && (
        <View style={styles.menu}>
          <ScrollView style={styles.menuScroll} nestedScrollEnabled>
            <ToolbarButton
              label="Fill Form"
              onPress={() => fill(defaultScenario ? { scenario: defaultScenario } : undefined)}
            />
            <ToolbarButton label="Regenerate" onPress={() => regenerate()} />
            <ToolbarButton label="Clear Form" onPress={() => clear()} />
            <ToolbarButton label="Replay last" onPress={doReplay} />
            <ToolbarButton label="Export JSON" onPress={doExport} />
            <ToolbarButton
              label={showScenarios ? 'Hide scenarios' : 'Scenarios…'}
              onPress={() => setShowScenarios((s) => !s)}
            />
            {showScenarios &&
              QUICK_SCENARIOS.map((s) => (
                <ToolbarButton
                  key={s.id}
                  label={`  ${s.label}`}
                  onPress={() => {
                    fill({ scenario: s.id });
                    setShowScenarios(false);
                  }}
                />
              ))}
            <ToolbarButton
              label="Personas…"
              onPress={() => {
                const personas = fakeFillerEngine.listPersonas();
                Alert.alert(
                  'Personas',
                  personas.map((p) => `• ${p.id} — ${p.label}`).join('\n'),
                  [
                    { text: 'Cancel', style: 'cancel' },
                    ...personas.slice(0, 3).map((p) => ({
                      text: p.id,
                      onPress: () => fill({ persona: p.id }),
                    })),
                  ]
                );
              }}
            />
          </ScrollView>
        </View>
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setExpanded((e) => !e)}
        onLongPress={
          longPressFills
            ? () => fill(defaultScenario ? { scenario: defaultScenario } : undefined)
            : undefined
        }
        delayLongPress={400}
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
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
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
    minWidth: 170,
    maxHeight: 360,
  },
  menuScroll: {
    maxHeight: 340,
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
