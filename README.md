# react-native-fake-filler

Intelligent, zero-config fake form filling for React Native.

Stop manually typing "John Doe" / "test@test.com" into every screen you build. Wrap your app in a provider, drop in `FFTextInput` (or register your own inputs), and fill an entire screen — realistic, unique, validation-aware, locale-aware fake data — with one call.

```tsx
import { FakeFiller } from 'react-native-fake-filler';

<Button title="Fill Form" onPress={() => FakeFiller.fillScreen()} />
```

> **For development and testing only.** This package never generates real personal, financial, or identity data — see [Security](#security).

---

## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [How field detection works](#how-field-detection-works)
- [Supported field types](#supported-field-types)
- [Non-text controls](#non-text-controls)
- [Personas](#personas)
- [Scenarios](#scenarios)
- [Related-field intelligence](#related-field-intelligence)
- [Validation-aware filling](#validation-aware-filling)
- [Fill history, replay & export](#fill-history-replay--export)
- [Shake-to-fill](#shake-to-fill)
- [UI-kit wrappers](#ui-kit-wrappers)
- [New user (API-safe)](#new-user-api-safe)
- [Chaos / negative mode](#chaos--negative-mode)
- [Multi-step wizard fill](#multi-step-wizard-fill)
- [Form-library adapters](#form-library-adapters)
- [Fake files & uploads](#fake-files--uploads)
- [Network / request body glue](#network--request-body-glue)
- [Persist fills](#persist-fills)
- [Remote persona sync](#remote-persona-sync)
- [Coverage overlay](#coverage-overlay)
- [Clipboard & QR share](#clipboard--qr-share)
- [Auth stubs (OTP / biometric / deep link)](#auth-stubs-otp--biometric--deep-link)
- [Screenshot fixtures](#screenshot-fixtures)
- [Generation modes](#generation-modes)
- [API reference](#api-reference)
- [Custom generators & rules](#custom-generators--rules)
- [Localization](#localization)
- [Developer toolbar](#developer-toolbar)
- [Testing guide (Jest / RNTL / Detox / Maestro / Appium)](#testing-guide)
- [E2E helpers](#e2e-helpers)
- [Expo example](#expo-example)
- [React Native CLI example](#react-native-cli-example)
- [Best practices](#best-practices)
- [Security](#security)

---

## Installation

```sh
npm install --save-dev react-native-fake-filler
# or
yarn add -D react-native-fake-filler
```

No native code, no linking, no config files. Works in Expo (managed or bare) and plain React Native CLI projects.

**Compatibility:** React Native 0.64+ (uses only `TextInput`, `View`, `StyleSheet`, `Platform` — no new-architecture-only APIs), React 17+, TypeScript 4.5+.

Because it ships pure JS/TS with no native modules, it also runs fine under Hermes and JSC, and works in the New Architecture without any changes.

---

## Quick start

**1. Wrap your app once, at the root:**

```tsx
// App.tsx
import { FakeFillerProvider, FakeFillerDevToolbar } from 'react-native-fake-filler';

export default function App() {
  return (
    <FakeFillerProvider>
      <RootNavigator />
      <FakeFillerDevToolbar />
    </FakeFillerProvider>
  );
}
```

`FakeFillerDevToolbar` renders nothing when `__DEV__` is false, so it's safe to leave mounted.

**2. Use `FFTextInput` instead of `TextInput`** (or register plain `TextInput`s manually — see below):

```tsx
import { FFTextInput } from 'react-native-fake-filler';
import { Button } from 'react-native';
import { FakeFiller } from 'react-native-fake-filler';

function SignupScreen() {
  return (
    <>
      <FFTextInput placeholder="First Name" />
      <FFTextInput placeholder="Last Name" />
      <FFTextInput placeholder="Email" keyboardType="email-address" />
      <FFTextInput placeholder="Phone Number" keyboardType="phone-pad" />
      <FFTextInput placeholder="Password" secureTextEntry />

      <Button title="Fill Form" onPress={() => FakeFiller.fillScreen()} />
    </>
  );
}
```

That's it — no per-field configuration. `FFTextInput` reports its `placeholder`, `label`, `accessibilityLabel`, `testID`, `name`, and `secureTextEntry`/`keyboardType` to the nearest provider; `fillScreen()` classifies each one and writes a realistic value straight into it.

### Using your own input components

If you already have a design-system `<Input />`, you don't have to switch to `FFTextInput`. Use the `useRegisterField` hook (or wrap your component once):

```tsx
import { useRegisterField } from 'react-native-fake-filler';

function MyInput({ placeholder, value, onChangeText, ...props }) {
  useRegisterField(placeholder ?? props.testID, onChangeText, { placeholder, testID: props.testID });
  return <CustomInput placeholder={placeholder} value={value} onChangeText={onChangeText} {...props} />;
}
```

---

## How field detection works

FakeFiller inspects, in order of precedence:

1. An explicit `fakeFillerType` prop (or `type` passed to `useRegisterField`) — always wins.
2. `secureTextEntry` → treated as a password field.
3. Keyword matching against `label`, `placeholder`, `accessibilityLabel`, `name`, `testID`, and `id` (case-insensitive, substring match), checked against ~90 field patterns ("email", "first name", "zip code", "cvv", "date of birth", …).
4. `keyboardType` as a last resort (`email-address` → email, `phone-pad`/`number-pad` → phone).

If nothing matches, the field is skipped (not filled with garbage) unless you provide a `fakeFillerType` or a custom generator.

You can check what FakeFiller would infer for a given field without filling anything:

```ts
FakeFiller.detectType({ placeholder: 'Confirm Password' }); // 'confirmPassword'
```

---

## Supported field types

| Category | Fields |
|---|---|
| Personal | firstName, lastName, middleName, fullName, nickname, username, initials |
| Authentication | email, password, confirmPassword, otp, pin, securityAnswer |
| Phone | mobileNumber, homeNumber, officeNumber, countryCode |
| Address | street, apartment, houseNumber, building, city, state, province, country, zipCode, postalCode |
| Business | company, department, designation, employeeId, website |
| Identity | dateOfBirth, age, gender, nationality |
| Banking *(test values only)* | creditCardNumber, cardExpiry, cvv, accountNumber, iban, bankName |
| Vehicle | vehicleNumber, licensePlate, vehicleManufacturer, vehicleModel, vin |
| Education | school, college, university, degree, major |
| Healthcare | bloodGroup, height, weight |
| Technology | uuid, apiKey, refreshToken, accessToken |
| Internet | domain, url, ipv4, ipv6, macAddress |
| Text | loremWord, sentence, paragraph, review, description, comment |
| Numbers | integer, float, percentage, currency |
| Dates | pastDate, futureDate, currentDate, randomDate |
| Controls | boolean, switch, checkbox, picker, radio, date |

Anything not on this list can be covered with a [custom generator](#custom-generators--rules) in one line.

---

## Non-text controls

Drop-in controls that register themselves like `FFTextInput`:

```tsx
import { FFSwitch, FFCheckbox, FFPicker, FFRadio, FFDate } from 'react-native-fake-filler';

<FFSwitch label="Marketing emails" />
<FFCheckbox label="I agree to the terms" />
<FFPicker label="Plan" options={['Free', 'Pro', 'Enterprise']} />
<FFRadio label="Account type" options={['Personal', 'Business']} />
<FFDate label="Date of birth" fakeFillerType="dateOfBirth" />
```

For your own Switch/Picker, use `useRegisterControl` with `controlKind: 'switch' | 'checkbox' | 'picker' | 'radio' | 'date'`.

---

## Personas

Coherent profiles so name, email, phone, and address belong to the same person:

```tsx
FakeFiller.fillPersona('qa-adult-us');
// Built-in: qa-adult-us | qa-adult-uk | qa-adult-in | qa-adult-sa | edge-long-name | minimal

FakeFiller.registerPersona({
  id: 'my-qa-user',
  label: 'Custom QA user',
  locale: 'en-US',
  values: { email: 'qa@example.com', firstName: 'Alex', lastName: 'Rivera' },
});
```

---

## Scenarios

Named fill sets for happy-path and negative tests:

```tsx
FakeFiller.fillScenario('signup');
FakeFiller.fillScenario('checkout');
FakeFiller.fillScenario('kyc');
FakeFiller.fillScenario('invalid-email');   // broken email on purpose
FakeFiller.fillScenario('edge-case-long-name');
```

Or via options: `FakeFiller.fillScreen({ scenario: 'login' })`.

---

## Related-field intelligence

On every fill pass (unless `disableRelated: true`), FakeFiller keeps values coherent:

- `password` ↔ `confirmPassword`
- `firstName` + `lastName` → `fullName`, `email`, `username`
- `city` / `state` / `zipCode` / `street` / `country` from one address
- `creditCardNumber` + `cardExpiry` + `cvv` as one card set

---

## Validation-aware filling

Respects `maxLength`, `minLength`, and `pattern` on `FFTextInput` / field signatures so generated values are less likely to fail client validation:

```tsx
<FFTextInput placeholder="Email" maxLength={64} pattern={/^[^@]+@[^@]+\.[^@]+$/} />
```

Pass `disableValidation: true` in fill options for negative tests.

---

## Fill history, replay & export

Every fill is snapshotted (last 20 by default):

```tsx
FakeFiller.fillScreen();
FakeFiller.replay();                    // re-apply last fill
FakeFiller.history();                   // FillSnapshot[]
FakeFiller.exportJson();                // pretty JSON
FakeFiller.exportEnv();                 // flat string map for Maestro
```

The dev toolbar exposes **Replay last** and **Export JSON**.

---

## Shake-to-fill

```tsx
import { useShakeToFill } from 'react-native-fake-filler';

useShakeToFill({ scenario: 'signup' });
```

Requires optional peer `expo-sensors`. Without it, the hook no-ops and the toolbar still works. Long-press the ⚡ FAB to fill.

```sh
npx expo install expo-sensors
```

---

## UI-kit wrappers

Wrap Paper / NativeBase / Tamagui / GlueStack / NativeWind inputs without rewriting call sites:

```tsx
import { TextInput } from 'react-native-paper';
import { withFakeFiller, createPaperTextInputWrapper } from 'react-native-fake-filler';

const FFPaperInput = createPaperTextInputWrapper(TextInput);
// or: const FFPaperInput = withFakeFiller(TextInput);
```

---

## New user (API-safe)

Every call creates a never-seen email/phone/username (timestamp + unique suffix) — ideal for signup/OTP APIs that reject duplicates:

```tsx
FakeFiller.newUser();
// result.user.email → "jordan.lee.m5k2x9@example.com"

const identity = FakeFiller.createNewUser('en-US'); // pack only, no fill
```

Toolbar: **New user (API)**. Prefer this over fixed personas when hitting real backends.

---

## Chaos / negative mode

Intentionally bad data for validation UI tests:

```tsx
FakeFiller.chaos();                          // mixed strategies
FakeFiller.chaos('invalid-email');
FakeFiller.chaos('mismatched-password');
FakeFiller.chaos('expired-card');
FakeFiller.chaos('underage');
FakeFiller.chaos('xss');
FakeFiller.fillScreen({ chaos: 'oversized' });
```

Kinds: `invalid-email`, `mismatched-password`, `expired-card`, `underage`, `xss`, `sql-injection`, `emoji-name`, `oversized`, `empty`, `whitespace`, `unicode-rtl`, `mixed`.

---

## Multi-step wizard fill

```tsx
await FakeFiller.fillFlow([
  { id: 'account', options: { scenario: 'signup' }, afterFill: () => tapNext() },
  { id: 'address', delayMs: 300, afterFill: () => tapNext() },
  { id: 'otp', options: { overrides: { otp: FakeFiller.generateOtp() } } },
]);

// or via hook
const { fillFlow } = useFillFlow();
await fillFlow([...]);
```

---

## Form-library adapters

```tsx
FakeFiller.fillReactHookForm({ setValue, trigger }, {
  fields: { email: 'email', password: 'password' },
});

FakeFiller.fillFormik(formik, { fields: { email: 'email' } });
FakeFiller.fillFinalForm(form, { fields: { email: 'email' } });
```

---

## Fake files & uploads

```tsx
const avatar = FakeFiller.createFakeFile('avatar');     // data: URI
const idScan = await FakeFiller.materializeFakeFile('id-scan'); // writes to cache if expo-file-system present
// kinds: avatar | id-scan | receipt | pdf | document | image
```

---

## Network / request body glue

```tsx
FakeFiller.fillScreen({ scenario: 'signup' });
const expected = FakeFiller.expectedRequestBody();
// expected.json / expected.body — assert in MSW / Mirage / Jest
FakeFiller.matchRequestBody(await req.json());
```

---

## Persist fills

Survives Metro reload when AsyncStorage or MMKV is installed:

```tsx
await FakeFiller.persistHistory();
await FakeFiller.restoreLastFill();
await FakeFiller.loadPersistedHistory();
```

Or `FakeFiller.fillScreen({ persist: true })`.

---

## Remote persona sync

Share staging users via a gist / CDN JSON:

```tsx
await FakeFiller.syncFromUrl('https://gist.githubusercontent.com/.../raw/pack.json');
FakeFiller.fillPersona('staging-user');
```

---

## Coverage overlay

```tsx
import { CoverageOverlay } from 'react-native-fake-filler';
<CoverageOverlay />
// or
FakeFiller.coverageReport(); // { coveragePercent, fields, ... }
```

Shows detected vs skipped fields so you know when detection missed something.

---

## Clipboard & QR share

```tsx
import { ShareFill } from 'react-native-fake-filler';
<ShareFill onShare={(json) => console.log(json)} />
await FakeFiller.copyLastFill();
```

---

## Auth stubs (OTP / biometric / deep link)

```tsx
FakeFiller.generateOtp();                    // "482913"
FakeFiller.stubBiometric('success');
await FakeFiller.promptBiometric();
const link = FakeFiller.buildDeepLink({ scheme: 'myapp', token: 'abc' });
await FakeFiller.openDeepLink(link);
const auth = FakeFiller.authFixture({ scheme: 'myapp' }); // { otp, token, deepLink }
```

---

## Screenshot fixtures

Deterministic data for Storybook / visual regression:

```tsx
const fx = FakeFiller.forScreenshot({ persona: 'qa-adult-us', seed: 42 });
// fx.values / fx.title stay stable across CI runs
```

---

## Generation modes

### Unique (default)

Every call produces fresh values, and FakeFiller tracks emails/usernames/IDs/etc. generated so far in the session to avoid collisions.

```tsx
FakeFiller.fillScreen(); // mode: 'unique'
```

### Random

Fresh values every time, but without uniqueness bookkeeping (slightly faster, fine when duplicates don't matter).

```tsx
FakeFiller.random();
```

### Seeded

Deterministic — the same seed always produces the same dataset. Great for snapshot tests and reproducing a specific bug.

```tsx
FakeFiller.seed(12345);
FakeFiller.fillScreen();
```

### Fixed

Pin specific field types to specific values while letting everything else generate normally.

```tsx
FakeFiller.fixed({
  email: 'developer@example.com',
  city: 'London',
});
FakeFiller.fillScreen();
```

---

## API reference

### `<FakeFillerProvider enabled?>`

Enables auto-registration for any `FFTextInput`/`useRegisterField` fields in its subtree. `enabled` defaults to `__DEV__`. You can nest providers per-screen if you want `fillScreen()` scoped to a subtree rather than the whole app.

### `<FFTextInput {...TextInputProps} fakeFillerType? fakeFillerKey? name? label?>`

Drop-in `TextInput` replacement that self-registers. Works controlled or uncontrolled.

### `useFakeFiller()`

```ts
const { fill, regenerate, clear, fieldCount } = useFakeFiller();
```

- `fill(options?)` — fills every registered field under the nearest provider.
- `regenerate(options?)` — alias for `fill`.
- `clear()` — resets every registered field to `''`.
- `fieldCount()` — number of fields currently registered.

### `useRegisterField(key, setValue, signature, type?)`

Low-level hook for wiring up custom input components (see above).

### `FakeFiller` (static API)

```ts
FakeFiller.fillScreen(options?)
FakeFiller.fill(targets, options?)      // target explicit refs/setters, no provider needed
FakeFiller.random(options?)
FakeFiller.seed(value)
FakeFiller.fixed(values)
FakeFiller.unique()
FakeFiller.setLocale(locale)
FakeFiller.getLocale() / listLocales() / isRtl()
FakeFiller.register(name, generatorFn)
FakeFiller.configure(rules)
FakeFiller.reset()
FakeFiller.clearScreen()
FakeFiller.detectType(signature)
FakeFiller.generate(type, options?)
FakeFiller.fillPersona(id, options?)
FakeFiller.fillScenario(id, options?)
FakeFiller.registerPersona / listPersonas
FakeFiller.registerScenario / listScenarios
FakeFiller.history() / replay(id?) / clearHistory()
FakeFiller.exportJson(id?) / exportEnv(id?) / lastValues()
FakeFiller.forE2E(options?)
FakeFiller.forScreenshot(options?)
FakeFiller.newUser(options?) / createNewUser(locale?)
FakeFiller.chaos(kind?)
FakeFiller.fillFlow(steps)
FakeFiller.fillReactHookForm / fillFormik / fillFinalForm
FakeFiller.createFakeFile / materializeFakeFile
FakeFiller.expectedRequestBody / matchRequestBody
FakeFiller.persistHistory / restoreLastFill / syncFromUrl
FakeFiller.coverageReport()
FakeFiller.generateOtp / stubBiometric / buildDeepLink / openDeepLink
```

`FillOptions`:

```ts
interface FillOptions {
  locale?: LocaleCode;
  mode?: 'unique' | 'random' | 'seeded' | 'fixed';
  seed?: number;
  overrides?: Record<string, string | Generator>;
  persona?: PersonaId | string;
  scenario?: ScenarioId | string;
  disableRelated?: boolean;
  disableValidation?: boolean;
}
```

### `FakeFiller.fill(targets)` — filling explicit refs

Useful in test scripts or when you don't want a provider at all:

```ts
FakeFiller.fill({
  email: (v) => setEmail(v),
  password: passwordInputRef, // anything exposing setNativeProps({ text })
});
```

---

## Custom generators & rules

Register a brand-new generator once, then use it anywhere by name:

```ts
FakeFiller.register('employeeCode', () => `EMP-${Math.floor(Math.random() * 100000)}`);
```

```tsx
<FFTextInput placeholder="Employee Code" fakeFillerType="employeeCode" />
```

Override built-in generators, or pin fixed values, with `configure`:

```ts
FakeFiller.configure({
  city: () => 'London',
  email: 'developer@example.com',
});
```

Per-call overrides (don't affect global config):

```ts
FakeFiller.fillScreen({
  overrides: { email: () => 'qa+smoke@example.com' },
});
```

---

## Localization

```ts
FakeFiller.setLocale('fr-FR');
FakeFiller.fillScreen();
FakeFiller.isRtl(); // true for ar-SA, etc.
FakeFiller.listLocales();
```

Built-in locales: `en-US`, `en-GB`, `fr-FR`, `de-DE`, `ar-SA`, `hi-IN`, `ja-JP`, `es-ES`, `pt-BR`, `zh-CN`, `tr-TR`.

Names, cities, states, streets, phones, postal codes, and sample sentences are locale-aware. Arabic (`ar-SA`) and Hindi/Japanese/Chinese use native-script sample data for RTL / CJK polish.

---

## Developer toolbar

```tsx
<FakeFillerDevToolbar
  position="bottom-right"
  onExport={(values, json) => console.log(json)}
/>
```

Floating "⚡" button (dev-only by default): **Fill Form**, **Regenerate**, **Clear Form**, **Replay last**, **Export JSON**, **Scenarios…**, **Personas…**. Long-press the FAB to fill immediately.

---

## Testing guide

FakeFiller's static `FakeFiller.fill()` API works without a provider or any React tree at all, which is what makes it usable from test runners.

### Jest / React Native Testing Library

```ts
import { render, fireEvent } from '@testing-library/react-native';
import { FakeFiller } from 'react-native-fake-filler';

test('signup form accepts generated data', () => {
  const { getByPlaceholderText } = render(<SignupScreen />);
  FakeFiller.seed(42); // deterministic across test runs
  fireEvent.changeText(getByPlaceholderText('Email'), FakeFiller.generate('email'));
});
```

### Detox

```js
await element(by.id('email')).typeText(FakeFiller.generate('email'));
await element(by.id('firstName')).typeText(FakeFiller.generate('firstName'));
```

### Maestro

Generate values ahead of time in a setup script and inject them as Maestro env vars, or drive your app's own "Fill Form" button (wired to `FakeFiller.fillScreen()`) directly from the flow:

```yaml
- tapOn: "Fill Form"
```

### Appium

Same idea as Detox — call `FakeFiller.generate(type)` in your test setup and feed the string into `sendKeys`.

---

## E2E helpers

Generate a full value bag without mounting React (ideal for Detox / Maestro / Appium setup scripts):

```ts
const data = FakeFiller.forE2E({ seed: 42, scenario: 'signup' });

await element(by.id('email')).typeText(data.values.email);
await element(by.id('password')).typeText(data.values.password);

// Maestro env snippet
console.log(data.toMaestroEnv());
```

---

## Expo example

Works out of the box in managed Expo — no config plugin, no native code:

```tsx
// App.tsx (Expo)
import { FakeFillerProvider, FFTextInput, FakeFillerDevToolbar, FakeFiller } from 'react-native-fake-filler';
import { Button, SafeAreaView } from 'react-native';

export default function App() {
  return (
    <FakeFillerProvider>
      <SafeAreaView style={{ padding: 16 }}>
        <FFTextInput placeholder="Full Name" />
        <FFTextInput placeholder="Email" keyboardType="email-address" />
        <Button title="Fill Form" onPress={() => FakeFiller.fillScreen()} />
      </SafeAreaView>
      <FakeFillerDevToolbar />
    </FakeFillerProvider>
  );
}
```

## React Native CLI example

Identical usage — the package has no native dependencies, so there's nothing to link or pod-install.

```tsx
// index.js
import { AppRegistry } from 'react-native';
import { FakeFillerProvider } from 'react-native-fake-filler';
import App from './App';
import { name as appName } from './app.json';

const Root = () => (
  <FakeFillerProvider>
    <App />
  </FakeFillerProvider>
);

AppRegistry.registerComponent(appName, () => Root);
```

---

## Best practices

- Keep `FakeFillerProvider`/`FakeFillerDevToolbar` mounted globally but rely on their `__DEV__` default to strip them from production behavior — no need for `if (__DEV__)` guards scattered through your code.
- Prefer `mode: 'unique'` (the default) for anything hitting a real or mock backend with uniqueness constraints (signup, checkout).
- Use `FakeFiller.seed(n)` in CI so flaky "duplicate email" failures become 100% reproducible.
- Give inputs a stable `testID` — it doubles as a reliable detection signal and as your E2E test selector.
- For fields your backend validates strictly (e.g. a specific ZIP format, a partner-specific ID scheme), reach for `FakeFiller.configure()` once at app startup rather than sprinkling `fakeFillerType` overrides everywhere.

---

## Security

FakeFiller **never** generates or stores real personal, governmental, or financial data:

- Names, emails, addresses, and phone numbers are synthetic (emails always resolve under `@example.com`, the [IANA-reserved](https://www.iana.org/help/example-domains) example domain).
- Card numbers are the well-known, publicly documented test numbers used by major payment sandboxes (Stripe/Braintree-style `4242...`, `4111...`, etc.) — they are not valid for real transactions.
- IDs, tokens, and keys are randomly generated and namespaced (`sk_test_...`, `rtk_...`) so they're obviously non-production if they ever leak into a log.

This package is intended **exclusively** for development, QA, and automated testing. Do not use generated values to impersonate real people or bypass identity verification in production systems.
