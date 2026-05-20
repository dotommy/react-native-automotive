# MessageTemplate

**Android-only.** A conversational/message-bubble template. iOS messaging on CarPlay is handled via Siri intents (`INSendMessageIntent`) plus the [Notifications module](/guide/notifications), not a template.

```ts
import { MessageTemplate } from 'react-native-automotive';
```

## Example

```tsx
const msg = new MessageTemplate({
  title: 'Reply to Alice',
  icon: require('./alice.png'),
  message: 'See you in 10 mins!',
  actions: [
    { id: 'send', title: 'Send' },
    { id: 'cancel', title: 'Cancel' },
  ],
});

Automotive.pushTemplate(msg);
```

## Source

[`packages/core/src/templates/android/MessageTemplate.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/templates/android/MessageTemplate.ts)
