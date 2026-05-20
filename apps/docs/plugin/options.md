# Plugin options reference

The Expo Config Plugin accepts two options. Both are passed in `app.config.js`:

```js
plugins: [
  ['react-native-automotive-expo-plugin', {
    carPlayCategory: 'navigation',
    androidAutoCategory: 'navigation',
  }],
],
```

## `carPlayCategory` (required)

Tells the plugin which `com.apple.developer.carplay-<category>` entitlement to write into `<YourApp>.entitlements`.

| Value | Apple entitlement | When to use |
|---|---|---|
| `'navigation'` | `com.apple.developer.carplay-navigation` | Turn-by-turn nav apps (Maps, Waze) |
| `'audio'` | `com.apple.developer.carplay-audio` | Music players, podcasts |
| `'communication'` | `com.apple.developer.carplay-communication` | VoIP, calling |
| `'messaging'` | `com.apple.developer.carplay-messaging` | Chat apps |
| `'parking'` | `com.apple.developer.carplay-parking` | Parking discovery / payment |
| `'fuel'` | `com.apple.developer.carplay-fuel` | Gas station finder / payment |
| `'driving-task'` | `com.apple.developer.carplay-driving-task` | Driving-related tasks (logbook, expenses) |
| `'ev'` | `com.apple.developer.carplay-ev` | EV charging |
| `'quick-food-ordering'` | `com.apple.developer.carplay-quick-food-ordering` | Drive-thru ordering |

Apple grants entitlements via manual review at the [CarPlay developer portal](https://developer.apple.com/contact/carplay/). You **must** select the category you actually applied for — using a different entitlement than what Apple approved will fail provisioning.

## `androidAutoCategory` (optional, default `'navigation'`)

Drives the `<category>` written into the `androidx.car.app.CarAppService` intent-filter in `AndroidManifest.xml`.

| Value | Androidx category | When to use |
|---|---|---|
| `'navigation'` | `androidx.car.app.category.NAVIGATION` | Turn-by-turn nav apps |
| `'poi'` | `androidx.car.app.category.POI` | Point-of-interest apps (parking, fuel, food) |
| `'iot'` | `androidx.car.app.category.IOT` | IoT remote control (lights, garage, EV charging at home) |
| `'charging'` | `androidx.car.app.category.CHARGING` | EV charging station finder / control |
| `'weather'` | `androidx.car.app.category.WEATHER` | Weather apps |

When `'navigation'`, the plugin additionally writes the `androidx.car.app.action.NAVIGATE` intent-filter (with `geo:` data scheme), so the system can route navigation intents to your app.

::: tip Why no `media` / `messaging` value
Android Auto handles **media** apps via `MediaBrowserServiceCompat` and **messaging** apps via `NotificationCompat.CarExtender` — both are different Android Services from `CarAppService`, so they're not valid `androidx.car.app.category.*` values. The messaging case is already covered cross-platform by [`AutomotiveNotifications`](/guide/notifications). Media is on the post-v1 roadmap as a companion package.
:::

## Switching categories

Just edit `app.config.js` and re-run `npx expo prebuild --clean`. The plugin is idempotent — old intent-filters are dropped, new ones written.

## What happens if you skip the plugin

You can install just `react-native-automotive` and write the native wiring yourself — see [Bare RN setup](/guide/setup-bare).

## Next

→ [What it writes (iOS)](/plugin/ios-output) — exact diffs the plugin applies to iOS files.
