# `<Grid>` (declarative)

Declarative wrapper for [`GridTemplate`](/templates/grid-template). Renders an icon-button grid.

```ts
import { Automotive, Grid } from 'react-native-automotive';
```

## Quick example

```tsx
<Automotive.Root>
  <Grid title="Audio sources">
    <Grid.Button
      title="Spotify"
      image={require('./icons/spotify.png')}
      onPress={() => switchTo('spotify')}
    />
    <Grid.Button
      title="Radio"
      image={require('./icons/radio.png')}
      onPress={() => switchTo('radio')}
    />
    <Grid.Button
      title="Podcasts"
      image={require('./icons/podcasts.png')}
      onPress={() => switchTo('podcasts')}
    />
  </Grid>
</Automotive.Root>
```

## Platform limits

| Platform | Max buttons |
|---|---|
| CarPlay | 8 |
| Android Auto | 6 |

Excess buttons are silently dropped by the platform. Design for 6 to be safe across both.

## Props reference

### `<Grid>`

| Prop | Type | Description |
|---|---|---|
| `title` | `string` | Navigation bar title. |
| `backButtonHidden` | `boolean` | Hide the back button. |
| `onBackButtonPressed` | `() => void` | Fired when the back button is pressed. |
| `children` | `<Grid.Button>` only | Required. |

### `<Grid.Button>`

| Prop | Type | Required | Description |
|---|---|:-:|---|
| `title` | `string` | one of title / titleVariants | Convenience: maps to `titleVariants: [title]`. |
| `titleVariants` | `string[]` | one of title / titleVariants | Localized variants, ordered most-to-least preferred. The system picks the variant that fits the available width. |
| `image` | `ImageSourcePropType` | yes | Button icon. |
| `disabled` | `boolean` | no | Default `false`. |
| `onPress` | `() => void` | no | Fired when tapped. |

## When to use `title` vs `titleVariants`

For most apps, a single English `title` is enough — the system has space for short labels (one short word usually fits everywhere).

If you ship in multiple languages or want to gracefully degrade long names, use `titleVariants`:

```tsx
<Grid.Button
  titleVariants={['Recently played', 'Recent', 'New']}
  image={require('./icons/recent.png')}
  onPress={...}
/>
```

## Re-render semantics

The current `GridTemplate` imperative class doesn't expose an in-place `updateButtons` method, so the declarative reconciler rebuilds the template on every commit where button content changes. This is fine for grids because:

- They're typically small (max 6-8 buttons)
- They don't update frequently (home screens don't change live)

If your grid needs frequent updates (e.g. dynamic audio source list), use the imperative `GridTemplate` directly and call your own update method as needed. An `updateButtons` method on `GridTemplate` is planned for v1.3, at which point the declarative path will switch to surgical updates automatically.

## Mixing with imperative

Same pattern as `<List>`:

```tsx
<Automotive.Root>
  <Grid title="Home">
    <Grid.Button title="Music" onPress={() => setMode('music')} image={...} />
    <Grid.Button title="Map" onPress={() => setMode('map')} image={...} />
  </Grid>
  {mode === 'map' && <ImperativeMapView />}
</Automotive.Root>
```

## Source

[`packages/core/src/declarative/Grid.tsx`](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/declarative/Grid.tsx)
