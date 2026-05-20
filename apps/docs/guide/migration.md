# Migration from birkir/react-native-carplay

`react-native-automotive` is an active fork of [`birkir/react-native-carplay`](https://github.com/birkir/react-native-carplay), which was last released in May 2023. Most of the API surface is the same — the migration is mostly mechanical.

## tl;dr

```bash
# 1. Swap the dependency
yarn remove react-native-carplay
yarn add react-native-automotive react-native-automotive-expo-plugin

# 2. Rename the singleton import everywhere
#    CarPlay -> Automotive
sed -i '' 's/from .react-native-carplay./from "react-native-automotive"/g' src/**/*.{ts,tsx}
sed -i '' 's/\bCarPlay\./Automotive./g' src/**/*.{ts,tsx}
sed -i '' 's/{ CarPlay,/{ Automotive,/g; s/{ CarPlay }/{ Automotive }/g' src/**/*.{ts,tsx}

# 3. If you're on Expo, drop the manual native edits and use the plugin
#    See: /guide/setup-expo
```

## The renames

| Old | New |
|---|---|
| `react-native-carplay` | `react-native-automotive` |
| `CarPlay` (singleton) | `Automotive` |
| `CarPlayInterface` (class) | `AutomotiveInterface` |

Everything else — template constructors, prop names, navigation methods, event names — stayed the same.

```ts
// Before
import { CarPlay, ListTemplate } from 'react-native-carplay';

CarPlay.registerOnConnect(() => {
  CarPlay.setRootTemplate(new ListTemplate({ ... }));
});

// After
import { Automotive, ListTemplate } from 'react-native-automotive';

Automotive.registerOnConnect(() => {
  Automotive.setRootTemplate(new ListTemplate({ ... }));
});
```

## What's different beyond the rename

### Expo Config Plugin

birkir had no Expo support. If you were on bare RN and hand-editing `Info.plist` / `AppDelegate.m` / `AndroidManifest.xml`, you can keep doing that — see [Bare RN setup](/guide/setup-bare). Or migrate to Expo (or just to the plugin even without Expo prebuild integration) and let it do the wiring.

### Notifications module

New in this library. If you were rolling your own notifications via `INSendMessageIntent` and `NotificationCompat.CarExtender`, you can drop that code and use the unified [`AutomotiveNotifications`](/guide/notifications) API.

### iOS native: Swift, not Objective-C

birkir shipped Obj-C with some Swift. We rewrote everything in Swift. **You don't need to do anything** — if you weren't subclassing or extending the native classes, the migration is transparent.

### Android native: Kotlin, not Java

Same — full Kotlin rewrite. Transparent to consumers.

### Android namespace

| Old | New |
|---|---|
| `org.birkir.carplay` | `io.automotive.rn` |
| `RNCarPlay` (Android) | `AutomotiveService`, `AutomotiveModule`, `AutomotivePackage` |

If you weren't referencing these directly (most users don't), nothing changes.

### iOS native module name

`RNCarPlay` is still the JS-visible native module name in v1.x (it's behind `Automotive.bridge`). It will be renamed to `RNAutomotive` in v2.0 along with the legacy `.m` cleanup. No action needed if you don't access `Automotive.bridge` directly.

### Templates dropped

None! All birkir templates are present. The ones not in the v1 supported roster (`PlaceListMapTemplate`, `PlaceListNavigationTemplate`, `RoutePreviewNavigationTemplate`, `VoiceControlTemplate`, `VoiceControlState`) moved to a sub-entry:

```ts
// Before
import { PlaceListMapTemplate } from 'react-native-carplay';

// After
import { PlaceListMapTemplate } from 'react-native-automotive/experimental';
```

They may be promoted to stable in a future major.

### Templates added

These didn't exist in birkir:

- `TabTemplate` (Android-only, the dedicated `androidx.car.app.TabTemplate` with `contentId` routing — distinct from `TabBarTemplate`)

### Behavior changes

- **Connection lifecycle**: birkir's `didConnect` could fire before the JS bridge was ready in some races. We added `bridge.checkForConnection()` in the singleton constructor that explicitly replays the event if a scene was already attached.
- **List template image sizing**: birkir didn't always apply `WindowInformation.scale` to images, leading to blurry icons on high-DPI head units. Fixed in v1.0.
- **Notification action taps when app is killed**: birkir didn't handle this at all (taps were lost). Now handled via the plugin-installed delegate.

## If you were using a fork of birkir

If your codebase had local patches on top of birkir, port them as PRs to this repo — open an issue first to discuss scope.

## Stuck?

Open an issue at [github.com/dotommy/react-native-automotive/issues](https://github.com/dotommy/react-native-automotive/issues) with your `package.json` snippet and the error message.
