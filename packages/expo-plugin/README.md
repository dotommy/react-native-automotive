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
| `androidAutoCategory` | `'navigation' \| 'poi' \| 'iot' \| 'charging' \| 'weather'` | no | Category for the `CarAppService` intent-filter. The plugin writes `androidx.car.app.category.<X>` accordingly. For `'navigation'`, also writes the `androidx.car.app.action.NAVIGATE` intent-filter (with `geo:` data scheme). Defaults to `'navigation'`. |

> **Note on Android Auto categories**: media apps (Spotify, podcasts) use `MediaBrowserServiceCompat`, a different pipeline not covered by this plugin — companion package coming post-v1. Messaging apps use `NotificationCompat.CarExtender`, which the core lib's `AutomotiveNotifications` module already handles cross-platform.

## What it writes

### iOS — `Info.plist`
Registers a CarPlay scene pointing at the library's `RNAutomotiveSceneDelegate`.

### iOS — entitlements
Adds `com.apple.developer.carplay-<category>` based on `carPlayCategory`.

### iOS — `AppDelegate.swift`
Adds `import react_native_automotive` and a `NotificationsDelegate.install()` call inside `application(_:didFinishLaunchingWithOptions:)`. Required so taps on notification action buttons reach JS even when the app is fully terminated (the system rehydrates the process and the delegate is set early enough to receive the `UNUserNotificationCenterDelegate` callback). Idempotent — re-running `expo prebuild` doesn't duplicate the injection.

Works against both the Expo SDK 53 multi-line Swift template and older inline templates. Also handles legacy Objective-C `AppDelegate.m`.

### Android — `AndroidManifest.xml`
- Adds the `androidx.car.app.*` permissions (`NAVIGATION_TEMPLATES`, `MAP_TEMPLATES`, `ACCESS_SURFACE`, `WAKE_LOCK`).
- Writes the `CarAppService` intent-filter with the chosen `androidAutoCategory`, attached to the lib's `AutomotiveService` (manifests merge at build time).
- For `'navigation'` apps, also writes the `androidx.car.app.action.NAVIGATE` intent-filter with `geo:` data scheme so the system can route navigation intents.
- Idempotent: previously-written intent-filters are dropped on each run, so switching `androidAutoCategory` between prebuilds doesn't accumulate stale entries.

## What it does NOT do

- Auto-detect features — you declare `carPlayCategory` and `androidAutoCategory` explicitly because both Apple and Google require intentional category selection.
- Request notification permissions at runtime — use a dedicated permissions library (e.g. `expo-notifications`).
- Configure Android Auto media apps — see the note above; that pipeline is a different Android Service (`MediaBrowserServiceCompat`) not covered here.

## Bare React Native

If you're not using Expo, read the source under [`src/`](src/) to see the exact strings written, then apply the equivalent edits to your hand-maintained `Info.plist`, `Entitlements`, `AppDelegate.swift`, and `AndroidManifest.xml`.

## Source, issues, contributions

https://github.com/dotommy/react-native-automotive

## License

MIT
