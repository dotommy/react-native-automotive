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
  - title: Modern Swift + Kotlin native
    details: Android fully rewritten in Kotlin. iOS template builders, scene delegate, store, and notifications are Swift; the orchestrator `RNCarPlay.m` remains Obj-C pending full Swift conversion in v2.0. Old + New Architecture compatible.
  - title: Notifications module
    details: Action-button taps and quick-reply text reach JS even when the app is fully terminated. Same API on both platforms.
  - title: Active fork of birkir/react-native-carplay
    details: Continues the work of the upstream library (unmaintained since May 2023). One-line migration from the old API.
  - title: Imperative + Declarative API
    details: Use whichever fits the screen. JSX (<List>, <Grid>, <Alert>, <ActionSheet>) for the 80% case. Imperative for full control or for templates not yet wrapped. The two styles coexist in the same project.
---

## Quick taste — declarative (JSX)

```tsx
import { Automotive, List } from 'react-native-automotive';

export default function App() {
  return (
    <Automotive.Root>
      <List title="My app">
        <List.Section header="Menu">
          <List.Item text="Hello, car" onPress={() => console.log('tapped')} />
        </List.Section>
      </List>
    </Automotive.Root>
  );
}
```

## …or imperative (full control)

```tsx
import { useEffect } from 'react';
import { Automotive, ListTemplate } from 'react-native-automotive';

export default function App() {
  useEffect(() => {
    const onConnect = () => {
      Automotive.setRootTemplate(new ListTemplate({
        title: 'My app',
        sections: [{ header: 'Menu', items: [{ text: 'Hello, car' }] }],
        onItemSelect: async ({ index }) => console.log(index),
      }));
    };
    Automotive.registerOnConnect(onConnect);
    return () => Automotive.unregisterOnConnect(onConnect);
  }, []);
  return null;
}
```

Either way, the Expo plugin handles all native wiring (entitlements, scene config, manifest permissions, notification delegate). Connect to the CarPlay simulator or the Android Auto Desktop Head Unit and watch it run.

[Continue to the full Getting Started →](/guide/introduction)
