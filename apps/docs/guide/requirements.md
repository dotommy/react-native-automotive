# Requirements

## Runtime

| | Minimum | Notes |
|---|---|---|
| iOS | 14 | CarPlay scene API (`CPTemplateApplicationSceneDelegate`) requires iOS 13.4+; we target 14 for stable behavior. |
| Android | API 30 (Android 11) | `androidx.car.app` Templates 1.4+ requires modern AndroidX. |
| React Native | 0.79 | Old + New Architecture compatible. |
| React | 18 or 19 | |
| Expo SDK | 53 | The plugin runs at `expo prebuild` time; tested on SDK 53. Older SDKs may work but aren't validated. |

## Build

| | Minimum | Notes |
|---|---|---|
| Xcode | 16 | For Swift 6 + the Expo SDK 53 AppDelegate template. |
| Android Gradle Plugin | 8.0+ | Comes from the Expo SDK 53 prebuild template. |
| Kotlin | 2.0.21 | Pinned via `expo-build-properties` to match the Compose Compiler. |
| JDK | 17 | |
| Node | 20+ | |

## OEM entitlements (real hardware only)

| Platform | What you need | How to get it |
|---|---|---|
| Apple CarPlay | One of the `com.apple.developer.carplay-<category>` entitlements (navigation, audio, communication, messaging, parking, fuel, driving-task, ev, quick-food-ordering) | Apply via the [CarPlay developer portal](https://developer.apple.com/contact/carplay/). Manual review; faster if you're in the MFi program. |
| Android Auto | App listed in Play Store under the right category (Navigation, POI, IoT, Charging, Weather) | Follow [Google's Android for Cars publication checklist](https://developer.android.com/training/cars/quality). |

You **do not need** either for development. Use:

- **Xcode CarPlay Simulator** — in Xcode, `I/O → External Displays → CarPlay`. Runs the simulated head unit alongside the iOS Simulator.
- **Android Auto Desktop Head Unit (DHU)** — bundled with the Android SDK. Connects to a phone or emulator over ADB; renders the AA UI on your desktop.

## Platform-specific quirks

- **CarPlay only**: rate limits enforced by `CPListTemplate` for `updateSections`.
- **Android Auto only**: certain templates (`MessageTemplate`, `SignInTemplate`) have no CarPlay equivalent and are exposed in the cross-platform API but raise a no-op on iOS.
- **Both**: notifications require runtime user permission grant (`expo-notifications` or equivalent).

## Next

→ [Installation](/guide/installation) — `yarn add` the two packages and wire the plugin.
