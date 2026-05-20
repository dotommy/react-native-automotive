# ActionSheetTemplate

A modal action sheet — like `AlertTemplate` but with more actions and a typically richer layout (sheet vs. dialog).

```ts
import { ActionSheetTemplate } from 'react-native-automotive';
```

## Example

```tsx
const sheet = new ActionSheetTemplate({
  title: 'Send location',
  message: 'Choose where to send',
  actions: [
    { id: 'sms', title: 'Text message' },
    { id: 'email', title: 'Email' },
    { id: 'cancel', title: 'Cancel', style: 'cancel' },
  ],
  onActionButtonPressed: ({ id }) => {
    handleShare(id);
    Automotive.dismissTemplate();
  },
});

Automotive.presentTemplate(sheet);
```

## Platform note

Android Auto: falls back to an alert-style presentation (the platform doesn't have a separate action-sheet primitive).

## Source

[`packages/core/src/templates/ActionSheetTemplate.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/templates/ActionSheetTemplate.ts)
