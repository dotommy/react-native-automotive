# Declarative API — overview

`react-native-automotive` ships **two parallel APIs** that you can mix freely in the same project:

| Style | Use when |
|---|---|
| **Imperative** — `Automotive.setRootTemplate(new ListTemplate(...))` | You want full control, or you're using a template the declarative API doesn't cover yet (Map, TabBar, Search, Information, …) |
| **Declarative** — `<Automotive.Root>` + `<List>` / `<Grid>` / `<Alert>` / `<ActionSheet>` | You want React-idiomatic JSX with `useState`-driven updates, automatic mount/unmount handling for modals, and per-item `onPress` instead of `onItemSelect({index})` cast |

The declarative API is a thin layer over the imperative one — under the hood, JSX is reconciled by a custom `react-reconciler` host that translates the tree into `Automotive.setRootTemplate` / `Automotive.presentTemplate` / `template.updateSections` calls.

## What's covered in v1.2

- `<Automotive.Root>` — entry point
- `<List>` + `<List.Section>` + `<List.Item>` — the workhorse list template
- `<Grid>` + `<Grid.Button>` — icon grid for home/launcher screens
- `<Alert>` + `<Alert.Action>` — modal alert (conditional mount = present, unmount = dismiss)
- `<ActionSheet>` + `<ActionSheet.Action>` — modal action sheet (same lifecycle)

## What stays imperative

- `MapTemplate` (needs a React component on a native surface — declarative `<Map>` lands in v1.4)
- `TabBarTemplate`, `SearchTemplate`, `InformationTemplate`, `ContactTemplate`, `PointOfInterestTemplate`, `NowPlayingTemplate` (land in v1.3)
- Android-only: `MessageTemplate`, `NavigationTemplate`, `PaneTemplate`, `SignInTemplate`, `TabTemplate`

Use the imperative API for those today. The two styles coexist in the same `<Automotive.Root>` subtree:

```tsx
import { useEffect, useState } from 'react';
import { Automotive, List, MapTemplate } from 'react-native-automotive';

function App() {
  const [showMap, setShowMap] = useState(false);

  // Declarative root menu
  return (
    <Automotive.Root>
      <List title="Main menu">
        <List.Section header="Actions">
          <List.Item text="Open map" onPress={() => setShowMap(true)} />
        </List.Section>
      </List>
      <ImperativeMapBridge active={showMap} />
    </Automotive.Root>
  );
}

// Imperative bridge — a regular hook component
function ImperativeMapBridge({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) return;
    const map = new MapTemplate({ component: MyMapView, /* ... */ });
    Automotive.pushTemplate(map);
    return () => Automotive.popTemplate();
  }, [active]);
  return null;
}
```

## Why hybrid (and not full declarative)

CarPlay and Android Auto **rate-limit UI updates** for driver safety. CarPlay logs warnings when a `CPListTemplate` updates faster than ~1 Hz. Android Auto enforces strict per-template content caps.

A full declarative reconciler would need to debounce React renders, diff at per-row granularity, and handle each template's rate limits independently. That's a 4-8 week project — and worth doing only when there's real user feedback on what abstractions actually matter.

The v1.2 declarative API targets the **80% case**: lists, grids, modals. These don't change frequently, and the reconciler can call surgical updates (`updateSections`) without hitting limits.

For the 20% where you need fine control or templates we haven't wrapped yet, you stay imperative. Both styles are first-class — neither is "the right one".

## Quick example — full app

```tsx
import { useEffect, useState } from 'react';
import { Automotive, List, Alert } from 'react-native-automotive';

export default function App() {
  const [pizzas, setPizzas] = useState(['Margherita', 'Diavola']);
  const [confirming, setConfirming] = useState<string | null>(null);

  return (
    <Automotive.Root>
      <List title="Pizza menu">
        <List.Section header="Today">
          {pizzas.map(name => (
            <List.Item
              key={name}
              text={name}
              onPress={() => setConfirming(name)}
            />
          ))}
        </List.Section>
      </List>

      {confirming && (
        <Alert title={`Order ${confirming}?`}>
          <Alert.Action title="No" style="cancel" onPress={() => setConfirming(null)} />
          <Alert.Action
            title="Yes"
            style="default"
            onPress={() => {
              placeOrder(confirming);
              setConfirming(null);
            }}
          />
        </Alert>
      )}
    </Automotive.Root>
  );
}
```

State changes (`setPizzas`, `setConfirming`) reactively update the car UI. No imperative `pushTemplate`/`popTemplate` calls anywhere.

## Next

→ [`<List>`](/guide/declarative-list) — the full reference for declarative lists.
