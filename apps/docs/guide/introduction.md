# Introduction

`react-native-automotive` is a React Native SDK that lets you build app surfaces for **Apple CarPlay** (iOS) and **Android Auto** from a single TypeScript codebase.

It's an active rewrite of [`birkir/react-native-carplay`](https://github.com/birkir/react-native-carplay), which was unmaintained since May 2023. The rewrite:

- rewrites the iOS template builders, scene delegate, store, and notifications in Swift (the `RNCarPlay.m` orchestrator and a couple of helpers remain Obj-C — full Swift conversion is planned for v2.0)
- replaces all Java with Kotlin on Android (no leftover Java)
- adds a first-class **Expo Config Plugin** so you never hand-edit native files
- adds a dedicated **notifications module** that works even when the app is fully terminated
- aims for full feature parity between CarPlay and Android Auto, not "iOS first, Android maybe"

## What is CarPlay / Android Auto?

Both are projection systems: your phone (or the app installed on the head unit) renders a constrained UI onto the car's display. Each platform exposes a **template-based** SDK — you can't draw arbitrary pixels, you instantiate `List`, `Grid`, `Map`, `Tab`, `Search`, `Alert` templates and the system renders them with the right font sizes, hit targets, and safe areas for in-car use.

Both Apple and Google **rate-limit UI updates** for driver-distraction reasons. You can't reactively re-render lists on every keystroke. The library exposes **two parallel APIs**:

```ts
// Imperative (full control, covers all templates)
const t = new ListTemplate({ ... });
Automotive.setRootTemplate(t);

// Declarative (JSX, covers List / Grid / Alert / ActionSheet in v1.2)
<Automotive.Root>
  <List title="...">
    <List.Section header="...">
      <List.Item text="..." onPress={...} />
    </List.Section>
  </List>
</Automotive.Root>
```

The declarative reconciler internally calls surgical updates (`listTemplate.updateSections(...)`) so rate limits aren't an issue for normal use. The two styles **coexist in the same project** — see [Declarative API overview](/guide/declarative-overview).

## What you'll need

To run on **real hardware**, both platforms require OEM-issued entitlements:

- **CarPlay**: Apple grants `com.apple.developer.carplay-<category>` entitlements after a manual review. Apply via [the CarPlay developer portal](https://developer.apple.com/contact/carplay/).
- **Android Auto**: Google requires apps to be listed in the Play Store with the right category. The Desktop Head Unit (DHU) bypasses this for development.

For **development** you don't need either. The Xcode CarPlay simulator and the Android Auto DHU work without any entitlement.

## Status

- v1.0: shipping (core templates, Expo plugin, notifications, example app)
- v1.1: in progress (rename `CarPlay` → `Automotive`, dynamic `androidAutoCategory`, this docs site)
- v1.x roadmap: declarative `<Map>` component, hosted docs search, companion media package

## Next

→ [Requirements](/guide/requirements) — what versions of iOS, Android, React Native, and Expo you need.
