// React Native's runtime injects `__DEV__` globally, and Hermes/JSC provide a
// `console` implementation. `@types/react-native` normally declares both;
// these ambient fallbacks just keep this package typecheckable on its own.
declare const __DEV__: boolean;

interface Console {
  warn(...args: unknown[]): void;
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
}
declare const console: Console;
