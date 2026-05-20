---
layout: home

hero:
  name: react-native-automotive
  text: One API. Two car platforms.
  tagline: React Native SDK for Apple CarPlay and Android Auto, with a first-class Expo Config Plugin and zero hand-edited native files.
  actions:
    - theme: brand
      text: Get started →
      link: /guide/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/dotommy/react-native-automotive

features:
  - title: Both platforms, one TypeScript API
    details: Write a template once, ship it on CarPlay (iOS) and Android Auto. Type-safe templates, type-safe events, type-safe everything.
  - title: Expo Config Plugin
    details: No hand-editing Info.plist, Entitlements, AppDelegate, or AndroidManifest. The plugin writes the right thing at every `expo prebuild`.
  - title: Swift on iOS, Kotlin on Android
    details: The native side was rewritten from scratch — no leftover Objective-C, no leftover Java. Old + New Architecture compatible.
  - title: Notifications module
    details: Action-button taps and quick-reply text reach JS even when the app is fully terminated. Same API on both platforms.
  - title: Active fork of birkir/react-native-carplay
    details: Continues the work of the upstream library (unmaintained since May 2023). One-line migration from the old API.
  - title: Imperative-first, declarative coming
    details: Mirrors the rate-limited native template APIs. A declarative React layer for map screens is on the v1.x roadmap.
---

## Quick taste

```tsx
import { useEffect } from 'react';
import { Automotive, ListTemplate } from 'react-native-automotive';

export default function App() {
  useEffect(() => {
    const onConnect = () => {
      Automotive.setRootTemplate(new ListTemplate({
        title: 'My app',
        sections: [{
          header: 'Menu',
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

That's the whole thing. The Expo plugin handles the rest of the native wiring — entitlements, scene config, manifest permissions, notification delegate. Connect to the CarPlay simulator or the Android Auto Desktop Head Unit and watch it run.

[Continue to the full Getting Started →](/guide/introduction)
