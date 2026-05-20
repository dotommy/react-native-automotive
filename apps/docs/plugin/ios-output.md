# Plugin output — iOS

What the plugin writes into your iOS project at `expo prebuild` time. Useful for debugging and for porting the wiring to bare React Native projects.

## `Info.plist`

Adds (or merges into) `UIApplicationSceneManifest`:

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
  </dict>
</dict>
```

Existing `UIWindowSceneSessionRoleApplication` (phone scene) entries are preserved.

## `<YourApp>.entitlements`

Adds one entry based on `carPlayCategory`:

```xml
<key>com.apple.developer.carplay-navigation</key>
<true/>
```

(replace `-navigation` with the configured category)

## `AppDelegate.swift`

Adds an import at the top (anchored on `import Expo`):

```swift
import react_native_automotive
```

Adds an install call inside `application(_:didFinishLaunchingWithOptions:)` (anchored on `) -> Bool {`):

```swift
    NotificationsDelegate.install()
```

The anchor handles both single-line and multi-line function signatures (Expo SDK 53 splits the signature across multiple lines). The injection is **idempotent** — re-running prebuild detects the existing line and skips.

If your AppDelegate is Objective-C (`AppDelegate.m`):

```objc
@import react_native_automotive;
// ...
[RNAutomotiveNotificationsDelegate install];
```

## Mod source

- [`withCarPlayScene.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/expo-plugin/src/withCarPlayScene.ts)
- [`withCarPlayEntitlement.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/expo-plugin/src/withCarPlayEntitlement.ts)
- [`withNotificationsDelegate.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/expo-plugin/src/withNotificationsDelegate.ts)
