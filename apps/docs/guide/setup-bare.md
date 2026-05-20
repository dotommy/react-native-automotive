# Setup with bare React Native

If you're not using Expo (no `expo prebuild`), you do the native wiring by hand. This page covers the four files you need to edit.

::: tip
The Expo plugin source under [`packages/expo-plugin/src/`](https://github.com/dotommy/react-native-automotive/tree/master/packages/expo-plugin/src) is the authoritative reference for *exactly* what to write. The snippets below are equivalent.
:::

## Install

```bash
yarn add react-native-automotive
# pods
cd ios && pod install
```

## iOS — `Info.plist`

Add the CarPlay scene under `UIApplicationSceneManifest`:

```xml
<key>UIApplicationSceneManifest</key>
<dict>
  <key>UISceneConfigurations</key>
  <dict>
    <key>CPTemplateApplicationSceneSessionRoleApplication</key>
    <array>
      <dict>
        <key>UISceneClassName</key>
        <string>CPTemplateApplicationScene</string>
        <key>UISceneConfigurationName</key>
        <string>CarPlayScene</string>
        <key>UISceneDelegateClassName</key>
        <string>RNAutomotiveSceneDelegate</string>
      </dict>
    </array>
    <!-- keep your existing UIWindowSceneSessionRoleApplication entries here -->
  </dict>
</dict>
```

## iOS — `<YourApp>.entitlements`

Add one of the `com.apple.developer.carplay-<category>` entitlements (you get the entitlement file from Apple after the CarPlay developer portal review):

```xml
<key>com.apple.developer.carplay-navigation</key>
<true/>
```

Replace `-navigation` with the category that matches your app (`-audio`, `-communication`, `-messaging`, `-parking`, `-fuel`, `-driving-task`, `-ev`, `-quick-food-ordering`).

## iOS — `AppDelegate.swift`

Add the import at the top and the install call inside `didFinishLaunchingWithOptions`:

```swift
import UIKit
import React
import Expo  // if you're on Expo bare
import react_native_automotive  // ← add

@UIApplicationMain
class AppDelegate: /* ... */ {
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    NotificationsDelegate.install()  // ← add
    // ... your existing code
    return true
  }
}
```

The `install()` call registers the library's `UNUserNotificationCenterDelegate` early enough that notification action taps reach JS even when the app is fully terminated.

If your AppDelegate is still Objective-C (`AppDelegate.m`):

```objc
@import react_native_automotive;  // top of file

// inside application:didFinishLaunchingWithOptions::
[RNAutomotiveNotificationsDelegate install];
```

## Android — `AndroidManifest.xml`

```xml
<manifest ...>
  <uses-permission android:name="androidx.car.app.NAVIGATION_TEMPLATES" />
  <uses-permission android:name="androidx.car.app.MAP_TEMPLATES" />
  <uses-permission android:name="androidx.car.app.ACCESS_SURFACE" />
  <uses-permission android:name="android.permission.WAKE_LOCK" />

  <application ...>
    <!-- The lib declares the AutomotiveService shell + APP_RELOAD intent-filter.
         You add the CarAppService intent-filter with your category. -->
    <service android:name="io.automotive.rn.AutomotiveService">
      <intent-filter>
        <action android:name="androidx.car.app.CarAppService" />
        <category android:name="androidx.car.app.category.NAVIGATION" />
      </intent-filter>
      <!-- Only if you're a navigation app: -->
      <intent-filter>
        <action android:name="androidx.car.app.action.NAVIGATE" />
        <category android:name="android.intent.category.DEFAULT" />
        <data android:scheme="geo" />
      </intent-filter>
    </service>
  </application>
</manifest>
```

Replace `androidx.car.app.category.NAVIGATION` with your category (`POI`, `IOT`, `CHARGING`, `WEATHER`).

## Verifying

After all of the above, build and run. Connect to CarPlay simulator or Android Auto DHU. If `Automotive.registerOnConnect` fires, the wiring is correct.

## Maintenance burden

Every time you upgrade `react-native-automotive`, check the [plugin source](https://github.com/dotommy/react-native-automotive/tree/master/packages/expo-plugin/src) for changes — new versions may add additional native wiring. Using the Expo plugin is strongly recommended unless you have a hard constraint against `expo prebuild`.

## Next

→ [Migration from birkir/react-native-carplay](/guide/migration) — if you're porting from the old library.
