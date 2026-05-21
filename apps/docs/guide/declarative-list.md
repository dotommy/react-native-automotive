# `<List>` (declarative)

Declarative wrapper for [`ListTemplate`](/templates/list-template). Renders a sectioned list on the car display.

```ts
import { Automotive, List } from 'react-native-automotive';
```

## Quick example

```tsx
<Automotive.Root>
  <List title="Recent trips">
    <List.Section header="This week">
      <List.Item text="Home → Office" detailText="12 mi · 28 min" onPress={() => view(0)} />
      <List.Item text="Office → Lunch" detailText="3 mi · 9 min" onPress={() => view(1)} />
    </List.Section>
    <List.Section header="Last week">
      <List.Item text="Home → Airport" detailText="24 mi · 41 min" onPress={() => view(2)} />
    </List.Section>
  </List>
</Automotive.Root>
```

## State-driven updates

Items, sections, title — all reactive to state changes:

```tsx
function MenuScreen() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/menu').then(r => r.json()).then(setItems);
  }, []);

  return (
    <Automotive.Root>
      <List title="Menu" loading={items.length === 0}>
        <List.Section header="Available">
          {items.map(name => (
            <List.Item
              key={name}
              text={name}
              onPress={() => order(name)}
            />
          ))}
        </List.Section>
      </List>
    </Automotive.Root>
  );
}
```

The reconciler internally calls `listTemplate.updateSections(...)` only when sections actually change, so you don't need to worry about rate limits with normal use.

## Props reference

### `<List>`

| Prop | Type | Platform | Description |
|---|---|:-:|---|
| `title` | `string` | both | Navigation bar title. |
| `loading` | `boolean` | Android | Show a loading spinner instead of items. |
| `headerAction` | `Action<'appIcon' \| 'back'>` | Android | Standard header action. |
| `emptyViewTitleVariants` | `string[]` | iOS | Empty-state titles, ordered most-to-least preferred. |
| `emptyViewSubtitleVariants` | `string[]` | iOS | Empty-state subtitles. |
| `backButtonHidden` | `boolean` | both | Hide the back button. |
| `onBackButtonPressed` | `() => void` | both | Fired when the back button is pressed. |
| `children` | `<List.Section>` only | — | Required. |

### `<List.Section>`

| Prop | Type | Required | Description |
|---|---|:-:|---|
| `header` | `string` | yes | Section header text. |
| `children` | `<List.Item>` only | yes | Required. |

### `<List.Item>`

Mirrors the full [`ListItem` interface](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/interfaces/ListItem.ts) from the imperative API, plus `onPress`:

| Prop | Type | Platform | Description |
|---|---|:-:|---|
| `text` | `string` | both | Primary text. |
| `detailText` | `string` | both | Subtitle. |
| `image` | `ImageSourcePropType` | both | Leading icon. |
| `images` | `ImageSourcePropType[]` | iOS | Image row strip. |
| `showsDisclosureIndicator` | `boolean` | iOS | Show › on trailing edge. |
| `isPlaying` | `boolean` | iOS | "Now playing" indicator. |
| `playbackProgress` | `number` | iOS | 0..1 progress bar. |
| `accessoryImage` | `ImageSourcePropType` | iOS | Trailing-edge icon. |
| `enabled` | `boolean` | Android | Default `true`. |
| `browsable` | `boolean` | Android | Show › indicator on Android. |
| `toggle` | `number` | Android | Toggle state (instead of action). |
| `action` | `Action<'custom'>` | Android | Trailing action button. |
| **`onPress`** | `() => void` | both | **New in declarative** — per-item handler. Replaces the imperative `onItemSelect({index})` cast. |

## How `onPress` routing works

The native side fires `onItemSelect` with a flat `index` across all sections. The reconciler walks `<List.Section>` and `<List.Item>` children in JSX order, builds a parallel handlers array, and routes the index back to the correct `onPress`.

This means **the order of items matters** — adding/removing items mid-render correctly re-binds handlers since React keys map to a fresh order on every commit.

## Mixing with imperative

You can keep the declarative `<List>` and push imperative templates on top of it:

```tsx
<Automotive.Root>
  <List title="...">{/* declarative root */}</List>
  <ImperativeMapView active={mapOpen} />
</Automotive.Root>

function ImperativeMapView({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) return;
    const map = new MapTemplate({ component: MyMap });
    Automotive.pushTemplate(map);
    return () => Automotive.popTemplate();
  }, [active]);
  return null;
}
```

## Limits

Both platforms cap how many items / sections / images a list can show. Query at runtime via `Automotive.bridge.getMaximumListItemCount(templateId)` — but with the declarative API you typically don't need to: just don't ship lists with hundreds of items.

## Source

[`packages/core/src/declarative/List.tsx`](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/declarative/List.tsx)
