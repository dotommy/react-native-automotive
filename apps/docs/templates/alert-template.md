# AlertTemplate

A modal alert presented **over** the current template. Use `Automotive.presentTemplate(alert)` / `dismissTemplate()`, **not** `push/pop`.

```ts
import { AlertTemplate } from 'react-native-automotive';
```

## Example

```tsx
const alert = new AlertTemplate({
  titleVariants: ['Cancel trip?', 'Stop navigation?'],
  actions: [
    { id: 'cancel', title: 'Keep going', style: 'cancel' },
    { id: 'stop', title: 'Cancel trip', style: 'destructive' },
  ],
  onActionButtonPressed: ({ id }) => {
    if (id === 'stop') cancelTrip();
    Automotive.dismissTemplate();
  },
});

Automotive.presentTemplate(alert);
```

`titleVariants` lets the system pick the variant that fits the available width.

## Action styles

| Style | Visual |
|---|---|
| `'default'` | Standard tappable button |
| `'cancel'` | Highlighted as the "back out" choice |
| `'destructive'` | Red / warning treatment |

## Source

[`packages/core/src/templates/AlertTemplate.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/templates/AlertTemplate.ts)
