# Setup with Expo

The recommended path. The Expo Config Plugin handles all native wiring at `expo prebuild` time — you never hand-edit `Info.plist`, `Entitlements`, `AppDelegate.swift`, or `AndroidManifest.xml`.

## Install

```bash
yarn add react-native-automotive react-native-automotive-expo-plugin
```

## Wire the plugin

In `app.config.js` (or `app.config.ts` / `app.json`):

```js
module.exports = {
  expo: {
    name: 'MyCarApp',
    slug: 'my-car-app',
    version: '1.0.0',
    ios: {
      bundleIdentifier: 'com.example.mycarapp',
    },
    android: {
      package: 'com.example.mycarapp',
    },
    plugins: [
      ['react-native-automotive-expo-plugin', {
        carPlayCategory: 'navigation',
        androidAutoCategory: 'navigation',
      }],
    ],
  },
};
```

Both `carPlayCategory` (required) and `androidAutoCategory` (optional, defaults to `'navigation'`) tell the plugin what kind of car app you're shipping. See [Plugin options reference](/plugin/options) for the full list.

## Generate native projects

```bash
npx expo prebuild --clean
```

`--clean` wipes `ios/` and `android/` before regenerating. Recommended on first install and after plugin upgrades.

## Run

```bash
npx expo run:ios       # builds + boots iOS Simulator
npx expo run:android   # builds + installs to running emulator/device
```

## What the plugin writes

### iOS

| File | What | Why |
|---|---|---|
| `Info.plist` | `UIApplicationSceneManifest` with a CarPlay scene pointing at `RNAutomotiveSceneDelegate` | iOS scene system requires explicit declaration of every scene role |
| `<app>.entitlements` | `com.apple.developer.carplay-<carPlayCategory>` | Apple requires the entitlement to use CarPlay APIs |
| `AppDelegate.swift` | `import react_native_automotive` + `NotificationsDelegate.install()` inside `application(_:didFinishLaunchingWithOptions:)` | Catches notification action taps even when the app is fully terminated |

### Android

| File | What | Why |
|---|---|---|
| `AndroidManifest.xml` (uses-permission) | `androidx.car.app.NAVIGATION_TEMPLATES`, `MAP_TEMPLATES`, `ACCESS_SURFACE`, `WAKE_LOCK` | Android requires explicit consumer opt-in to permissions, even those declared by libraries |
| `AndroidManifest.xml` (intent-filter) | `androidx.car.app.CarAppService` with `category.<androidAutoCategory>` | Categorizes your app for Android Auto |
| `AndroidManifest.xml` (intent-filter, navigation only) | `androidx.car.app.action.NAVIGATE` with `geo:` data scheme | Lets the system route navigation intents to your app |

The library's own `AndroidManifest.xml` declares the `AutomotiveService` shell (and an internal `APP_RELOAD` intent-filter). Both manifests merge during Gradle build.

## Re-running prebuild

The plugin is **idempotent**:

- Existing entries are detected and skipped (no duplication)
- Switching `androidAutoCategory` drops the previous intent-filter and writes the new one (no stale entries)
- AppDelegate injections use marker tags — re-running doesn't add the same line twice

So `npx expo prebuild` is always safe to run.

## Troubleshooting

### iOS build fails with "no such module 'react_native_automotive'"

The plugin's `AppDelegate` injection happened but the Swift module wasn't included. Run `cd ios && pod install`.

### Android: `CarAppService not found`

You probably skipped `androidx.car.app.app` in your app dependencies. The library declares it transitively, but if you have a Gradle resolution conflict, add an explicit `implementation 'androidx.car.app:app:1.4.0'` (or current) to `android/app/build.gradle`.

### Plugin option doesn't update the manifest

Run `expo prebuild --clean` to force a full regeneration. The plugin only re-runs on missing/changed files by default.

## Next

→ [Plugin options reference](/plugin/options) — full list of `carPlayCategory` and `androidAutoCategory` values.
