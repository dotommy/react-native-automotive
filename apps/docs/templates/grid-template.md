# GridTemplate

A grid of icon buttons. Good for compact menus where each item has a clear visual identity (audio sources, vehicle controls, IoT toggles).

```ts
import { GridTemplate } from 'react-native-automotive';
```

## Example

```tsx
const grid = new GridTemplate({
  title: 'Audio sources',
  buttons: [
    { id: 'radio', titleVariants: ['FM Radio'], image: require('./radio.png') },
    { id: 'spotify', titleVariants: ['Spotify'], image: require('./spotify.png') },
    { id: 'podcasts', titleVariants: ['Podcasts'], image: require('./podcasts.png') },
  ],
  onButtonPressed: ({ id }) => switchAudio(id),
});

Automotive.setRootTemplate(grid);
```

## Limits

| Platform | Max buttons |
|---|---|
| CarPlay | 8 |
| Android Auto | 6 |

## Source

[`packages/core/src/templates/GridTemplate.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/templates/GridTemplate.ts) · full prop reference in JSDoc.

::: tip Full reference
The full prop table lands in a follow-up docs pass. For now the source's TSDoc is the authoritative reference.
:::
