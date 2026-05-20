# Connection lifecycle

The `Automotive` singleton emits two events: `didConnect` and `didDisconnect`. They fire when the OS routes a CarPlay or Android Auto scene to your app, not when the user just plugs in the cable (the OS may launch any compatible app, not necessarily yours).

## Event sequence

```
USER PLUGS PHONE INTO CAR
    |
    v
OS chooses an app to launch on the head unit
    |
    v
If your app is chosen:
    - iOS:    CPTemplateApplicationScene attaches to your app
    - Android: CarAppService starts
    |
    v
react-native-automotive:
    - emits 'didConnect' with WindowInformation
    - sets Automotive.connected = true
    - sets Automotive.window = { width, height, scale }
    |
    v
Your registerOnConnect callback fires.
You call Automotive.setRootTemplate(...)
    |
    v
... user interacts ...
    |
    v
USER UNPLUGS / DISCONNECTS
    |
    v
react-native-automotive:
    - emits 'didDisconnect'
    - sets Automotive.connected = false
    - sets Automotive.window = undefined
    |
    v
Your registerOnDisconnect callback fires (if registered).
```

## The "already connected when you register" case

The OS can launch your app *because* CarPlay is already connected — the app process starts up with an active scene. In that case the `didConnect` event has already fired by the time your `useEffect` runs.

To handle this, `Automotive` calls `bridge.checkForConnection()` in its constructor. This asks the native side to re-emit `didConnect` if a scene is already attached. So your callback fires correctly either way.

**Practical consequence**: always register `onConnect` in `useEffect` on app mount, even if `Automotive.connected` is already `true`. The library replays the event for you.

## React StrictMode and double-registration

In dev, React StrictMode runs effects twice. Without cleanup, you'd subscribe twice and `onConnect` would fire twice, building two root templates and creating a race.

**Always pair `register` with `unregister`:**

```ts
useEffect(() => {
  const onConnect = () => Automotive.setRootTemplate(/* ... */);
  Automotive.registerOnConnect(onConnect);
  return () => Automotive.unregisterOnConnect(onConnect);
}, []);
```

The same applies to `registerOnDisconnect`.

## Connection state in your UI

Show different UI on the phone depending on whether the car is connected. Use `Automotive.connected` synchronously, or wire it into state:

```tsx
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { Automotive } from 'react-native-automotive';

export function CarStatusLabel() {
  const [connected, setConnected] = useState(Automotive.connected);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    Automotive.registerOnConnect(onConnect);
    Automotive.registerOnDisconnect(onDisconnect);
    return () => {
      Automotive.unregisterOnConnect(onConnect);
      Automotive.unregisterOnDisconnect(onDisconnect);
    };
  }, []);

  return <Text>{connected ? 'Connected to car' : 'Phone only'}</Text>;
}
```

## `WindowInformation`

The `didConnect` callback receives:

```ts
type WindowInformation = {
  width: number;   // display width in points
  height: number;  // display height in points
  scale: number;   // density scale (1, 2, 3...)
};
```

These describe the **car display**, not the phone display. Useful for choosing image asset sizes — image rendering on car displays varies dramatically (Mercedes vs. Toyota vs. Tesla).

## What `didConnect` does NOT mean

- It doesn't mean the user has tapped your app icon on the head unit. The first launch usually does, but subsequent connections may resume your already-running app.
- It doesn't mean your app is now in the foreground on the phone. The phone screen might be locked or showing another app.
- On Android, it doesn't mean `CarAppService.onCreate()` ran; the bridge fires `didConnect` once the React Native bridge is ready, which is slightly later.

## Next

→ [Template navigation stack](/guide/navigation-stack) — push/pop semantics, what counts as "the same template", how present/dismiss work.
