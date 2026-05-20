# PaneTemplate

**Android-only.** A vertical strip of rows with title + optional actions at the bottom. Use for "status board" screens: vehicle status, account info, summary cards.

```ts
import { PaneTemplate } from 'react-native-automotive';
```

## Example

```tsx
const pane = new PaneTemplate({
  title: 'Battery',
  pane: {
    rows: [
      { title: '84%', text: 'Estimated range: 268 mi' },
      { title: 'Healthy', text: 'No issues detected' },
    ],
    actions: [
      { id: 'find-charger', title: 'Find charger' },
    ],
  },
});

Automotive.pushTemplate(pane);
```

## Source

[`packages/core/src/templates/android/PaneTemplate.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/templates/android/PaneTemplate.ts)
