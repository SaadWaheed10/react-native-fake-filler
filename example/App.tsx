import React from 'react';
import { SafeAreaView, Text, Button, StyleSheet, ScrollView, View } from 'react-native';
import {
  FakeFillerProvider,
  FakeFillerDevToolbar,
  FFTextInput,
  FFSwitch,
  FFCheckbox,
  FFPicker,
  FFRadio,
  FFDate,
  FakeFiller,
  useShakeToFill,
} from 'react-native-fake-filler';

function SignupScreen() {
  useShakeToFill({ scenario: 'signup' });

  return (
    <ScrollView contentContainerStyle={styles.form}>
      <Text style={styles.heading}>Create account</Text>

      <FFTextInput style={styles.input} placeholder="First Name" />
      <FFTextInput style={styles.input} placeholder="Last Name" />
      <FFTextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        maxLength={64}
      />
      <FFTextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" />
      <FFTextInput style={styles.input} placeholder="Password" secureTextEntry />
      <FFTextInput style={styles.input} placeholder="Confirm Password" secureTextEntry />
      <FFTextInput style={styles.input} placeholder="City" />
      <FFTextInput style={styles.input} placeholder="ZIP Code" keyboardType="number-pad" />

      <Text style={styles.subheading}>Non-text controls</Text>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Marketing emails</Text>
        <FFSwitch label="Marketing emails" />
      </View>
      <FFCheckbox label="I agree to the terms" />
      <FFPicker label="Country tier" options={['Free', 'Pro', 'Enterprise']} />
      <FFRadio label="Account type" options={['Personal', 'Business']} />
      <FFDate label="Date of birth" fakeFillerType="dateOfBirth" />

      <Button title="⚡ Fill Form" onPress={() => FakeFiller.fillScreen()} />
      <Button title="Persona: qa-adult-us" onPress={() => FakeFiller.fillPersona('qa-adult-us')} />
      <Button title="Scenario: checkout" onPress={() => FakeFiller.fillScenario('checkout')} />
      <Button title="Replay last" onPress={() => FakeFiller.replay()} />
      <Button title="Fill with seed 42" onPress={() => FakeFiller.fillScreen({ seed: 42 })} />
      <Button title="Clear" onPress={() => FakeFiller.clearScreen()} />
    </ScrollView>
  );
}

export default function App() {
  return (
    <FakeFillerProvider>
      <SafeAreaView style={styles.safeArea}>
        <SignupScreen />
      </SafeAreaView>
      <FakeFillerDevToolbar
        onExport={(values, json) => {
          // Wire to clipboard / logger in your app
          console.log('FakeFiller export', values, json);
        }}
      />
    </FakeFillerProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  form: { padding: 20, gap: 12 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subheading: { fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLabel: { fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
});
