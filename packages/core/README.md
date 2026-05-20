# react-native-automotive

React Native SDK for **Apple CarPlay** and **Android Auto**. One TypeScript API, both platforms.

Modern Swift on iOS (with an `RNCarPlay.m` orchestrator residual from the upstream fork, slated for full Swift conversion in v2.0). Kotlin-only on Android. Old + New Architecture compatible. Dedicated notifications module.

This is the **core** package — for zero-touch native setup in an Expo project, install [`react-native-automotive-expo-plugin`](https://www.npmjs.com/package/react-native-automotive-expo-plugin) alongside.

## Install

```bash
yarn add react-native-automotive
# or
npm install react-native-automotive
```

Peer dependencies: `react@^18.0.0 || ^19.0.0`, `react-native@>=0.79`.

## Requirements

- iOS 14+
- Android API 30+
- React Native 0.79+

CarPlay and Android Auto both require **OEM-issued entitlements** from Apple/Google to run on real hardware. The Xcode CarPlay simulator and the Android Auto Desktop Head Unit work without them.

## Quick start

```tsx
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

## Native setup

### With Expo

Use the companion config plugin — it writes everything (Info.plist scene, entitlements, AppDelegate hook, AndroidManifest permissions) at `expo prebuild` time:

```bash
yarn add react-native-automotive-expo-plugin
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

### Bare React Native

You wire the native side by hand:

**iOS** — in `Info.plist` add a `UIApplicationSceneManifest` entry pointing the CarPlay role at `RNAutomotiveSceneDelegate`. Add the `com.apple.developer.carplay-<category>` entitlement. In `AppDelegate.swift`'s `application(_:didFinishLaunchingWithOptions:)` call `NotificationsDelegate.install()` (after `import react_native_automotive`).

**Android** — declare `androidx.car.app.CATEGORY_*` permissions and the `CarAppService` in `AndroidManifest.xml`. The `io.automotive.rn.CarAppService` class is exported from this package.

The Expo plugin source under [`react-native-automotive-expo-plugin`](https://www.npmjs.com/package/react-native-automotive-expo-plugin) shows the exact strings written — use it as a reference for hand-maintained projects.

## Available templates

Cross-platform: `ActionSheetTemplate`, `AlertTemplate`, `ContactTemplate`, `GridTemplate`, `InformationTemplate`, `ListTemplate`, `MapTemplate`, `NowPlayingTemplate`, `PointOfInterestTemplate`, `SearchTemplate`, `TabBarTemplate`.

Android-only: `MessageTemplate`, `NavigationTemplate`, `PaneTemplate`, `SignInTemplate`, `TabTemplate`.

Experimental templates (`PlaceListMap`, `PlaceListNavigation`, `RoutePreview`, `VoiceControlTemplate`) live under `react-native-automotive/experimental` — API may change within 1.x.

Each template has TSDoc on its constructor with the full prop reference. A hosted docs site lands with v1.1.

## Navigation API

`Automotive.setRootTemplate(template)` — replace the root.
`Automotive.pushTemplate(template, animated?)` — push onto the stack (the same template can't be pushed twice).
`Automotive.popTemplate(animated?)` — pop one.
`Automotive.popToTemplate(template, animated?)` — pop to a specific entry.
`Automotive.popToRoot(animated?)` — pop all.
`Automotive.presentTemplate(template, animated?)` — present modally (alerts, action sheets).
`Automotive.dismissTemplate(animated?)` — dismiss the modal.
`Automotive.registerOnConnect(cb)` / `unregisterOnConnect(cb)` — connection lifecycle.
`Automotive.registerOnDisconnect(cb)` / `unregisterOnDisconnect(cb)`.

## Notifications

```tsx
import { AutomotiveNotifications } from 'react-native-automotive';

AutomotiveNotifications.addListener('actionPressed', ({ notificationId, actionId, response }) => {
  // user tapped an action button or replied with text from the car
});
```

The native delegate is registered automatically by the Expo plugin, so taps reach JS even from a fully-terminated app.

## Imperative-first by design

The native CarPlay and Android Auto SDKs are template-based and rate-limit UI updates for driver-distraction reasons. The public API mirrors that: construct a template, hand it to `Automotive.setRootTemplate` / `pushTemplate`. A declarative React layer for unrestricted screens ships later in 1.x.

## Source, issues, contributions

https://github.com/dotommy/react-native-automotive

## License

MIT
