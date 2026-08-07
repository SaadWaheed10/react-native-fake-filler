import React from 'react';
import { SafeAreaView, Text, Button, StyleSheet, ScrollView } from 'react-native';
import {
  FakeFillerProvider,
  FakeFillerDevToolbar,
  FFTextInput,
  FakeFiller,
} from 'react-native-fake-filler';

function SignupScreen() {
  return (
    <ScrollView contentContainerStyle={styles.form}>
      <Text style={styles.heading}>Create account</Text>

      <FFTextInput style={styles.input} placeholder="First Name" />
      <FFTextInput style={styles.input} placeholder="Last Name" />
      <FFTextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
      <FFTextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" />
      <FFTextInput style={styles.input} placeholder="Password" secureTextEntry />
      <FFTextInput style={styles.input} placeholder="Confirm Password" secureTextEntry />
      <FFTextInput style={styles.input} placeholder="City" />
      <FFTextInput style={styles.input} placeholder="ZIP Code" keyboardType="number-pad" />

      <Button title="⚡ Fill Form" onPress={() => FakeFiller.fillScreen()} />
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
      <FakeFillerDevToolbar />
    </FakeFillerProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  form: { padding: 20, gap: 12 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
});
