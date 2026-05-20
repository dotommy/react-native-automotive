# NavigationTemplate

**Android-only.** Android Auto's dedicated navigation UI shell — turn-by-turn arrow, ETA card, lane guidance. On iOS, navigation is rendered into `MapTemplate` via `startNavigationSession`.

```ts
import { NavigationTemplate } from 'react-native-automotive';
```

## Example

```tsx
const nav = new NavigationTemplate({
  component: MyMap,
  actionStrip: {
    actions: [
      { id: 'stop', title: 'End trip' },
    ],
  },
});

Automotive.setRootTemplate(nav);
```

Like `MapTemplate`, the `component` prop is a React tree rendered onto the car's map surface (via `VirtualRenderer`).

## Source

[`packages/core/src/templates/android/NavigationTemplate.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/templates/android/NavigationTemplate.ts)
