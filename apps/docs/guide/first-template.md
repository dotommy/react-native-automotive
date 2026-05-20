# Your first template

This walks you from a fresh Expo app to a `ListTemplate` rendering on the CarPlay simulator (or the Android Auto Desktop Head Unit).

## Prerequisite

You completed [Installation](/guide/installation) and `npx expo prebuild --clean` succeeded.

## Write the JS

Replace your `App.tsx`:

```tsx
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Automotive, ListTemplate } from 'react-native-automotive';

export default function App() {
  useEffect(() => {
    const onConnect = () => {
      const root = new ListTemplate({
        title: 'My car app',
        sections: [
          {
            header: 'Demo',
            items: [
              { text: 'Hello, car 👋' },
              { text: 'Tap me', detailText: 'A list item with detail text' },
            ],
          },
        ],
        onItemSelect: async ({ index }) => {
          console.log('selected index:', index);
        },
      });
      Automotive.setRootTemplate(root);
    };

    Automotive.registerOnConnect(onConnect);
    return () => Automotive.unregisterOnConnect(onConnect);
  }, []);

  return (
    <View style={styles.root}>
      <Text>Connect to CarPlay or Android Auto</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
```

Three things are happening:

1. **`registerOnConnect`** — fires when the car head unit connects to the phone. The library calls your callback with information about the car's window (width, height, scale).
2. **`new ListTemplate(...)`** — constructs a template object. Templates are imperative — instantiating doesn't render anything until you hand it to `Automotive`.
3. **`Automotive.setRootTemplate(root)`** — replaces whatever's on the car display with the new template.

`unregisterOnConnect` in the cleanup function is important: React StrictMode mounts the effect twice in dev, and without cleanup you'd end up with duplicate handlers.

## Run on iOS

```bash
npx expo run:ios
```

Once the app boots in the iOS simulator:

1. In Xcode (top menu): `I/O → External Displays → CarPlay`.
2. A new window opens — the simulated CarPlay head unit.
3. Open your app from the CarPlay window. Your `onConnect` should fire and the `ListTemplate` should render.

Logs print to the Xcode console.

## Run on Android

```bash
npx expo run:android
```

Then set up the Desktop Head Unit (DHU):

1. Enable developer options on the phone/emulator → enable USB debugging.
2. From your Android SDK, run `dhu` (or download it from [Google's instructions](https://developer.android.com/training/cars/testing/dhu)).
3. The DHU connects over ADB and renders the Android Auto UI on your desktop.
4. Open your app's icon in the DHU. `onConnect` fires; the template renders.

Logs print to `adb logcat` (filter on `Automotive` or your package).

## What just happened

```
+----------------+   register/connect   +---------------------+
|  Your App.tsx  | <------------------- |  Automotive native  |
|  (JS thread)   |                      |  (Swift / Kotlin)   |
+----------------+                      +---------------------+
        |                                         |
        | new ListTemplate({ ... })               |
        | Automotive.setRootTemplate(root)        |
        |---------------------------------------->|
        |                                         |
        |                                         | createTemplate(...)
        |                                         | setRootTemplate(id)
        |                                         |
        |                       +-----------------+--------------------+
        |                       v                                      v
        |                +--------------+                      +----------------+
        |                |  CarPlay      |                      | Android Auto   |
        |                |  CPListTemp.  |                      | ListTemplate   |
        |                +--------------+                      +----------------+
```

Templates are constructed in JS, sent to the native side via the bridge, then translated into the platform-native template types (`CPListTemplate` on iOS, `androidx.car.app.model.ListTemplate` on Android).

## Next

→ [Imperative API](/guide/imperative-api) — understand `pushTemplate`, `popTemplate`, `presentTemplate`, and when each one is the right call.
