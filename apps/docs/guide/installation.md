# Installation

The library ships as **two packages**:

| Package | What it does |
|---|---|
| [`react-native-automotive`](https://npmjs.com/package/react-native-automotive) | Core SDK: templates, navigation, notifications, native modules. |
| [`react-native-automotive-expo-plugin`](https://npmjs.com/package/react-native-automotive-expo-plugin) | Expo Config Plugin that wires everything native at `expo prebuild` time. |

If you're using Expo, install both. If you're on bare React Native, only the core is required (you'll do the native wiring by hand — see [Bare React Native setup](/guide/setup-bare)).

## With Expo (recommended)

```bash
yarn add react-native-automotive react-native-automotive-expo-plugin
```

Add the plugin to your `app.config.js`:

```js
// app.config.js
module.exports = {
  expo: {
    name: 'MyCarApp',
    slug: 'my-car-app',
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

Then regenerate the native projects:

```bash
npx expo prebuild --clean
```

That's it. The plugin will have written:

- iOS: a CarPlay scene in `Info.plist`, the `com.apple.developer.carplay-navigation` entitlement, an import + `NotificationsDelegate.install()` call in `AppDelegate.swift`.
- Android: `androidx.car.app.*` permissions, the `CarAppService` intent-filter with `androidx.car.app.category.NAVIGATION`, and the `NAVIGATE` intent-filter for `geo:` intents.

Run on a device or simulator:

```bash
npx expo run:ios
npx expo run:android
```

→ See [Plugin options reference](/plugin/options) for the full set of options.

## With bare React Native

```bash
yarn add react-native-automotive
# or
npm install react-native-automotive
```

Then follow [Bare React Native setup](/guide/setup-bare) to hand-edit `Info.plist`, the entitlements file, `AppDelegate.swift`, and `AndroidManifest.xml`.

## Verifying the install

Add a one-liner to your `App.tsx` and check the import resolves:

```ts
import { Automotive } from 'react-native-automotive';
console.log(Automotive.connected); // false until you connect to a head unit
```

If TypeScript is happy and the app builds, you're set.

## Next

→ [Your first template](/guide/first-template) — set a `ListTemplate` as the root and see it on the car display.
