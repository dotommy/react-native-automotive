# CarPlay vs Android Auto

The two platforms overlap a lot but aren't identical. This page is the map.

## Template parity matrix

| Library template | iOS (CarPlay) | Android (Android Auto) | Notes |
|---|---|---|---|
| `ListTemplate` | ✅ `CPListTemplate` | ✅ `androidx.car.app.model.ListTemplate` | Bread and butter. Item limits differ — check `getMaximumListItemCount()`. |
| `GridTemplate` | ✅ `CPGridTemplate` | ✅ `GridTemplate` | Apple caps at 8 buttons; Android at 6. |
| `MapTemplate` | ✅ `CPMapTemplate` | ✅ `NavigationTemplate` + `SurfaceRenderer` | Different native shapes; the lib normalizes. Custom React component renders on the map surface. |
| `TabBarTemplate` | ✅ `CPTabBarTemplate` | ✅ via `TabTemplate` shim | Root-only. |
| `SearchTemplate` | ✅ `CPSearchTemplate` | ✅ `SearchTemplate` | |
| `InformationTemplate` | ✅ `CPInformationTemplate` | ✅ `PaneTemplate` shim | |
| `ContactTemplate` | ✅ `CPContactTemplate` | ⚠️ approximate via `MessageTemplate` | |
| `PointOfInterestTemplate` | ✅ `CPPointOfInterestTemplate` | ✅ `PlaceListMapTemplate` | |
| `NowPlayingTemplate` | ✅ `CPNowPlayingTemplate` | ❌ no-op | Android Auto media uses `MediaBrowserService`, separate pipeline. |
| `AlertTemplate` | ✅ `CPAlertTemplate` | ✅ alert mechanism | Presented modally. |
| `ActionSheetTemplate` | ✅ `CPActionSheetTemplate` | ⚠️ falls back to alert | |
| `MessageTemplate` | ❌ | ✅ `MessageTemplate` | Android-only conversational template. |
| `NavigationTemplate` | ❌ | ✅ `NavigationTemplate` | Android-only nav UI shell. |
| `PaneTemplate` | ❌ | ✅ `PaneTemplate` | Android-only key-value display. |
| `SignInTemplate` | ❌ | ✅ `SignInTemplate` | Android-only auth flow. |
| `TabTemplate` | ❌ | ✅ `TabTemplate` (the dedicated one) | Android-only tabs with contentId routing. |

## What's deliberately different

### Entitlements vs. categories

- **CarPlay** requires one `com.apple.developer.carplay-<category>` entitlement (navigation, audio, communication, messaging, parking, fuel, driving-task, ev, quick-food-ordering). You get it from Apple via manual review.
- **Android Auto** requires one `androidx.car.app.category.*` (navigation, poi, iot, charging, weather) in your `CarAppService` intent-filter. You get it by publishing to Play Store under the right category.

These are not 1:1. iOS has `messaging` and `audio`; Android handles those via *different services* (`NotificationCompat.CarExtender` and `MediaBrowserServiceCompat` respectively). See the [Notifications module](/guide/notifications) for the messaging story.

### Rate limits

- **CarPlay** logs warnings when you update a list template more than once per second. The library doesn't enforce — it's up to you.
- **Android Auto** enforces `CONTENT_LIMIT_TYPE_*` strict caps at native render time. Templates over the cap simply don't render certain rows.

Practical guidance: design for the smaller limit (Android), test on both.

### Navigation intent

- **iOS**: handled via Siri intents (`INStartCallIntent`, `INSendMessageIntent` for voice). The library wires up the basics.
- **Android**: handled via the `androidx.car.app.action.NAVIGATE` intent-filter (`geo:` data scheme). The Expo plugin writes this automatically when `androidAutoCategory: 'navigation'`.

### What rendering looks like

- **CarPlay** is a **native UIKit-rendered scene** with strict templates. No custom drawing.
- **Android Auto** uses **`androidx.car.app` templates** plus a `Surface` callback for the map view, on which the library renders a `ReactRootView` (yes, full React Native — see `VirtualRenderer.kt`). This means `MapTemplate.component` renders an actual JSX tree on the car display.

This asymmetry is why declarative React is on the roadmap *for map screens specifically* — the Android side already supports it natively, and CarPlay's CPMapTemplate has overlay primitives we can wrap similarly.

## Defaults the library picks

| | iOS | Android |
|---|---|---|
| `Action` type for templates | `Action` (custom) | `Action` (Android constants where applicable) |
| Image source handling | `Image.resolveAssetSource` + cached | `Image.resolveAssetSource` + scaled by `WindowInformation.scale` |
| Connection auto-detect | `bridge.checkForConnection()` polls on app start | `CarAppService.onCreate()` fires the event |

## What this means in practice

If you're writing a feature that exists on both platforms, just use the cross-platform template. The library handles the mapping.

If you're writing iOS-only or Android-only behavior, branch on `Platform.OS`:

```tsx
import { Platform } from 'react-native';
import { Automotive, NowPlayingTemplate, MessageTemplate } from 'react-native-automotive';

if (Platform.OS === 'ios') {
  Automotive.pushTemplate(new NowPlayingTemplate({ ... }));
} else {
  Automotive.pushTemplate(new MessageTemplate({ ... }));
}
```

## Next

→ [Notifications module](/guide/notifications) — the cross-platform messaging API.
