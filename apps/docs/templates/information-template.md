# InformationTemplate

Displays a list of label/detail rows plus a strip of action buttons. Use it for "summary" screens: trip details, vehicle status, account info.

```ts
import { InformationTemplate } from 'react-native-automotive';
```

## Example

```tsx
const info = new InformationTemplate({
  title: 'Trip details',
  leading: true,
  items: [
    { title: 'Distance', detail: '24.3 mi' },
    { title: 'Duration', detail: '32 min' },
    { title: 'Tolls', detail: '$4.50' },
  ],
  actions: [
    { id: 'start', title: 'Start' },
    { id: 'cancel', title: 'Cancel' },
  ],
  onActionButtonPressed: ({ id }) => {
    if (id === 'start') startTrip();
  },
});

Automotive.pushTemplate(info);
```

## Methods

- `updateInformationTemplateItems(items)` — replace the items
- `updateInformationTemplateActions(actions)` — replace the actions

## Source

[`packages/core/src/templates/InformationTemplate.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/templates/InformationTemplate.ts)
