# Imperative API

The library exposes two parallel APIs. This page documents the **imperative** one, which works for all templates. For the **declarative (JSX)** API covering `<List>` / `<Grid>` / `<Alert>` / `<ActionSheet>`, see [Declarative API overview](/guide/declarative-overview). The two styles coexist freely in the same project.

Imperative: you construct a template instance, then call methods on `Automotive` to mount, push, pop, present, or dismiss it.

This mirrors how the native CarPlay and Android Auto SDKs actually work — both Apple's `CPTemplateNavigationController` and Android's `Screen` push/pop stack are imperative on the native side. We don't fake a reactive layer over a non-reactive native primitive.

## The `Automotive` singleton

`Automotive` is a singleton instance you import as a named export:

```ts
import { Automotive } from 'react-native-automotive';
```

It exposes connection state, event registration, and template navigation methods.

## Lifecycle methods

| Method | When to use |
|---|---|
| `Automotive.registerOnConnect(cb)` | Subscribe to head unit connections. Cb gets `WindowInformation`. |
| `Automotive.unregisterOnConnect(cb)` | Cleanup (always pair with register in `useEffect`). |
| `Automotive.registerOnDisconnect(cb)` | Subscribe to disconnections. |
| `Automotive.unregisterOnDisconnect(cb)` | Cleanup. |
| `Automotive.connected` | Boolean — current connection state. |
| `Automotive.window` | `WindowInformation \| undefined` — current car display info. |

See [Connection lifecycle](/guide/lifecycle) for the full event sequence.

## Navigation methods

| Method | Effect |
|---|---|
| `Automotive.setRootTemplate(t, animated?)` | Replace the root. **Call this first**, before any push/pop. |
| `Automotive.pushTemplate(t, animated?)` | Push onto the nav stack. |
| `Automotive.popTemplate(animated?)` | Pop the top entry. |
| `Automotive.popToTemplate(t, animated?)` | Pop until `t` is on top. |
| `Automotive.popToRootTemplate(animated?)` | Pop everything down to the root. |
| `Automotive.presentTemplate(t, animated?)` | Show modally (only `AlertTemplate` / `ActionSheetTemplate`). |
| `Automotive.dismissTemplate(animated?)` | Dismiss the modal. |

`animated` defaults to `true`. See [Template navigation stack](/guide/navigation-stack) for stack mechanics.

## Misc methods

| Method | Effect |
|---|---|
| `Automotive.enableNowPlaying(enabled)` | iOS: toggle the system Now Playing template. |

## Why not a declarative React tree?

The native SDKs **rate-limit UI updates** for driver safety. CarPlay throws warnings when you update a `CPListTemplate`'s sections more than once per second. Android Auto enforces per-template content limits and refuses to render lists over the cap.

A naive React reconciler would re-render on every state change → instant rate-limit violation. To do declarative right, the reconciler needs:

- Batching with awareness of native rate caps
- A way to express "this is a controlled, infrequent update" vs "this changes on every keystroke"
- Diff strategies that minimize re-renders even when JS state churns

The v1.x roadmap includes a **declarative `<Map>` component** for the one screen type where Apple and Google relax these limits (map overlays). For everything else, imperative is the right tool.

## Pattern: template ownership in React

Templates are JS objects with `id` strings. They map 1:1 to native template instances. The React-side rule:

> **Construct templates in `useEffect`, hand them to `Automotive`, and don't try to garbage-collect them.**

The native side keeps templates alive until you `pop` them off the stack. Letting the JS reference go is fine — the native side has its own retention via `id`.

```tsx
useEffect(() => {
  const root = new ListTemplate({ ... });
  Automotive.setRootTemplate(root);
  // No cleanup needed for the template itself.
}, []);
```

## Next

→ [Connection lifecycle](/guide/lifecycle) — what happens when the user plugs in / disconnects / backgrounds the app.
