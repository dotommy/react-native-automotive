# react-native-automotive

React Native SDK for **Apple CarPlay** and **Android Auto**. One TypeScript API, both platforms, first-class **Expo Config Plugin** for zero-touch native setup.

> Active rewrite of [`birkir/react-native-carplay`](https://github.com/birkir/react-native-carplay) (unmaintained since May 2023). Modern Swift + Kotlin native side, Expo support out of the box, dedicated notifications module.

## Status

v1 in progress — Step 10 of 11 closed (example app green on both iOS and Android CI). Step 11 (docs site + npm publish) is the only thing between you and `npm install react-native-automotive`.

## Requirements

| | Minimum |
|---|---|
| iOS | 14 |
| Android | API 30 |
| React Native | 0.79 |
| React | 19 |
| Expo SDK | 53 (for the config plugin) — bare RN works too |

CarPlay and Android Auto both require **OEM-issued entitlements** before your app can run on real hardware. The simulators (Xcode CarPlay simulator / Android Auto Desktop Head Unit) work without them.

## Packages

| Package | Description |
|---|---|
| [`react-native-automotive`](packages/core/) | Core SDK: templates, navigation, notifications, native modules. |
| [`react-native-automotive-expo-plugin`](packages/expo-plugin/) | Expo Config Plugin: writes Info.plist, Entitlements, AppDelegate, AndroidManifest at prebuild time. |

## Quick start (Expo)

```bash
yarn add react-native-automotive react-native-automotive-expo-plugin
```

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

```bash
npx expo prebuild
```

```tsx
// App.tsx
import { useEffect } from 'react';
import { Automotive, ListTemplate } from 'react-native-automotive';

export default function App() {
  useEffect(() => {
    const onConnect = () => {
      Automotive.setRootTemplate(new ListTemplate({
        title: 'My app',
        sections: [{
          header: 'Demo',
          items: [{ text: 'Hello, car' }],
        }],
        onItemSelect: async ({ index }) => console.log(index),
      }));
    };
    Automotive.registerOnConnect(onConnect);
    return () => Automotive.unregisterOnConnect(onConnect);
  }, []);

  return null;
}
```

That's it — `expo prebuild` regenerates `ios/` and `android/` with the CarPlay scene, entitlements, notifications delegate, and Android Auto permissions already wired.

## Quick start (bare React Native)

Without Expo you do the native wiring by hand:

- **iOS** — add a CarPlay scene in `Info.plist` pointing at `RNAutomotiveSceneDelegate`, add the `com.apple.developer.carplay-<category>` entitlement, call `RNAutomotiveNotificationsDelegate.install()` from `AppDelegate.application(_:didFinishLaunchingWithOptions:)`.
- **Android** — declare the `androidx.car.app.CATEGORY_*` permissions and the `CarAppService` in `AndroidManifest.xml`.

The Expo plugin is just a shortcut for the above — read [`packages/expo-plugin/src/`](packages/expo-plugin/src/) to see exactly what gets written, and copy-paste into your hand-maintained native projects.

## Available templates

Cross-platform: `ActionSheetTemplate`, `AlertTemplate`, `ContactTemplate`, `GridTemplate`, `InformationTemplate`, `ListTemplate`, `MapTemplate`, `NowPlayingTemplate`, `PointOfInterestTemplate`, `SearchTemplate`, `TabBarTemplate`.

Android-only: `MessageTemplate`, `NavigationTemplate`, `PaneTemplate`, `SignInTemplate`, `TabTemplate`.

Experimental templates (`PlaceListMap`, `PlaceListNavigation`, `RoutePreview`, `VoiceControlTemplate`) live under `react-native-automotive/experimental` — API may change in 1.x.

Each template has TSDoc on its constructor with the full prop reference. The hosted docs site lands with v1.1.

## Imperative vs. declarative

The native CarPlay and Android Auto SDKs are template-based and rate-limited (Apple and Google both restrict UI update frequency for driver-distraction reasons). The library is **imperative-first** to match that constraint — you instantiate a template, then call `Automotive.setRootTemplate(t)` / `Automotive.pushTemplate(t)`.

A declarative React layer for unrestricted screens (map overlays) ships later in 1.x.

## Notifications

```tsx
import { AutomotiveNotifications } from 'react-native-automotive';

AutomotiveNotifications.addListener('actionPressed', ({ notificationId, actionId, response }) => {
  // user tapped an action button or replied with text from the car
});
```

The native delegate is registered automatically by the Expo plugin, so action taps reach JS even if the app was fully terminated when the user tapped.

## Example app

[`apps/example`](apps/example/) is a minimal Expo bare workflow that boots a single `ListTemplate` when the car head unit connects. Run it from the monorepo root — see [`apps/example/README.md`](apps/example/README.md) for the exact commands.

## Differences vs. `birkir/react-native-carplay`

|  | birkir | react-native-automotive |
|---|---|---|
| iOS language | Objective-C + Swift | **Swift** (builders, scene, store, notifications) + slim Obj-C bridge (`RNCarPlay.m`) pending v2.0 conversion |
| Android language | Java + Kotlin | **Kotlin only** |
| RN architecture | Old Arch | Old + New Arch |
| Expo support | None | **Config plugin** |
| API style | Imperative only | Imperative + (declarative in 1.x) |
| Notifications | Not handled | **Dedicated module** |
| Android Auto parity | Partial | Full (goal) |
| Maintenance | Discontinued May 2023 | Active |

## Contributing

The repo is a Turborepo monorepo:

```
packages/
  core/           — react-native-automotive
  expo-plugin/    — react-native-automotive-expo-plugin
apps/
  example/        — Expo bare workflow demo
```

```bash
yarn install
yarn turbo run build
yarn turbo run typecheck
```

PRs welcome — open an issue first for anything larger than a one-file fix.

## License

MIT — see [LICENSE](LICENSE).

Original work (c) Birkir Rafn Guðjónsson and the `react-native-carplay` contributors. Continued work (c) Tommaso and contributors to `react-native-automotive`.
