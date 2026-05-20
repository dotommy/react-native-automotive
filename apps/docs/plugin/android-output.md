# Plugin output — Android

What the plugin writes into your Android project at `expo prebuild` time.

## `AndroidManifest.xml` — permissions

Adds four `<uses-permission>` entries:

```xml
<uses-permission android:name="androidx.car.app.NAVIGATION_TEMPLATES" />
<uses-permission android:name="androidx.car.app.MAP_TEMPLATES" />
<uses-permission android:name="androidx.car.app.ACCESS_SURFACE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

Android requires consumer apps to declare these explicitly — they cannot be inherited from the library's manifest by merge alone.

## `AndroidManifest.xml` — service intent-filters

Adds a `<service>` entry that merges with the lib's own `AutomotiveService` declaration:

```xml
<service android:name="io.automotive.rn.AutomotiveService">
  <intent-filter>
    <action android:name="androidx.car.app.CarAppService" />
    <category android:name="androidx.car.app.category.NAVIGATION" />
  </intent-filter>
</service>
```

Replace `NAVIGATION` with `POI`, `IOT`, `CHARGING`, or `WEATHER` depending on `androidAutoCategory`.

When `androidAutoCategory === 'navigation'`, the plugin **also** writes the navigate intent-filter:

```xml
<service android:name="io.automotive.rn.AutomotiveService">
  <!-- CarAppService intent-filter as above -->
  <intent-filter>
    <action android:name="androidx.car.app.action.NAVIGATE" />
    <category android:name="android.intent.category.DEFAULT" />
    <data android:scheme="geo" />
  </intent-filter>
</service>
```

This lets the system route `geo:` navigation intents to your app.

## What the library itself declares

The library's own `AndroidManifest.xml` (in `packages/core/android`) declares:

```xml
<service android:name=".AutomotiveService" android:exported="true">
  <intent-filter>
    <action android:name="io.automotive.rn.APP_RELOAD" />
  </intent-filter>
</service>
<meta-data android:name="androidx.car.app.minCarApiLevel" android:value="1" />
<receiver
  android:name="io.automotive.rn.notifications.AutomotiveNotificationsReceiver"
  android:exported="false" />
```

The plugin's consumer-side declarations merge with these at Gradle build time.

## Idempotency

On re-runs of `expo prebuild`:

- Permissions: `AndroidConfig.Permissions.addPermission` checks for existing entries, skips if present.
- Service intent-filters: the plugin **drops any previous `CarAppService` / `NAVIGATE` intent-filter for `AutomotiveService` before writing fresh ones**. This means switching `androidAutoCategory` between prebuilds doesn't accumulate stale entries — the manifest always reflects the current option.

## Mod source

- [`withAndroidCarAppPermissions.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/expo-plugin/src/withAndroidCarAppPermissions.ts)
- [`withAndroidCarAppService.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/expo-plugin/src/withAndroidCarAppService.ts)
