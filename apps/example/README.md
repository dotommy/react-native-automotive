# react-native-automotive — example app

Minimal Expo bare workflow demo for `react-native-automotive` v1.
Demonstrates the wiring chain: JS template constructor → native bridge
→ CarPlay / Android Auto scene → display on the car head unit.

## What is in here

A single `ListTemplate` set as the CarPlay root template when the
phone connects to a head unit. Enough to prove the plugin + native
modules + JS API all line up.

For richer demos covering every template + the notifications module,
see the JSDoc on each `*Template` class in
[`packages/core/src/templates/`](../../packages/core/src/templates/).

## Running locally (requires macOS for iOS)

From the **monorepo root**:

```bash
# Install workspace deps + build the TS packages (core + plugin)
yarn install
yarn turbo run build --filter=react-native-automotive --filter=react-native-automotive-expo-plugin

# Generate native projects from app.config.js (plugin runs here)
yarn workspace @automotive/example prebuild

# Run on iOS Simulator (CarPlay Simulator via Xcode → I/O → External Displays → CarPlay)
yarn workspace @automotive/example ios

# Or run on Android (Android Auto via DHU — Desktop Head Unit)
yarn workspace @automotive/example android
```

## Continuous Native Generation

The `ios/` and `android/` directories are **gitignored**. They get
regenerated on every `expo prebuild`. The
[`react-native-automotive-expo-plugin`](../../packages/expo-plugin/)
writes the CarPlay scene config, the entitlements, the AppDelegate
notification delegate install, and the Android Auto manifest
permissions automatically.

If you want to inspect what the plugin produced, run
`yarn workspace @automotive/example prebuild` and open `ios/` or
`android/`.
