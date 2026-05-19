# react-native-automotive-expo-plugin

Expo Config Plugin for [`react-native-automotive`](https://www.npmjs.com/package/react-native-automotive). Configures CarPlay and Android Auto natively at `expo prebuild` time so you never touch `Info.plist`, `Entitlements`, `AppDelegate`, or `AndroidManifest` by hand.

## Install

```bash
yarn add react-native-automotive-expo-plugin
# or
npm install react-native-automotive-expo-plugin
```

Peer dependency: any modern `expo` (SDK 50+, validated on SDK 53).

## Setup

```js
// app.config.js
export default {
  expo: {
    plugins: [
      ['react-native-automotive-expo-plugin', {
        carPlayCategory: 'navigation',
        androidAutoCategory: 'navigation',
      }],
    ],
  },
};
```

Then:

```bash
npx expo prebuild
```

## Options

| Option | Type | Required | Description |
|---|---|:-:|---|
| `carPlayCategory` | `'navigation' \| 'audio' \| 'communication' \| 'messaging' \| 'parking' \| 'fuel' \| 'driving-task' \| 'ev' \| 'quick-food-ordering'` | yes | The CarPlay entitlement to request from Apple. Apple requires exactly one `com.apple.developer.carplay-<category>` entitlement per app. |
| `androidAutoCategory` | `'navigation' \| 'media' \| 'messaging' \| 'pointofinterest' \| 'iot'` | no | Informational in v1 — the library's `CarAppService` intent filter currently hard-codes `navigation`. Multi-category override lands in v1.1. Defaults to `'navigation'`. |

## What it writes

### iOS — `Info.plist`
Registers a CarPlay scene pointing at the library's `RNAutomotiveSceneDelegate`.

### iOS — entitlements
Adds `com.apple.developer.carplay-<category>` based on `carPlayCategory`.

### iOS — `AppDelegate.swift`
Adds `import react_native_automotive` and a `NotificationsDelegate.install()` call inside `application(_:didFinishLaunchingWithOptions:)`. Required so taps on notification action buttons reach JS even when the app is fully terminated (the system rehydrates the process and the delegate is set early enough to receive the `UNUserNotificationCenterDelegate` callback). Idempotent — re-running `expo prebuild` doesn't duplicate the injection.

Works against both the Expo SDK 53 multi-line Swift template and older inline templates. Also handles legacy Objective-C `AppDelegate.m`.

### Android — `AndroidManifest.xml`
Adds the `androidx.car.app.CATEGORY_*` permissions and ensures the `CarAppService` declaration is present.

## What it does NOT do (out of scope for v1)

- Auto-detect features — you declare `carPlayCategory` explicitly because Apple requires intentional category selection.
- Request notification permissions at runtime — use a dedicated permissions library (e.g. `expo-notifications`).
- Override the hard-coded Android Auto `NAVIGATION` category — coming in 1.1.

## Bare React Native

If you're not using Expo, read the source under [`src/`](src/) to see the exact strings written, then apply the equivalent edits to your hand-maintained `Info.plist`, `Entitlements`, `AppDelegate.swift`, and `AndroidManifest.xml`.

## Source, issues, contributions

https://github.com/dotommy/react-native-automotive

## License

MIT
