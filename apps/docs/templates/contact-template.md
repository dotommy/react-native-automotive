# ContactTemplate

Renders a single contact (name, image, action buttons). On CarPlay it maps to `CPContactTemplate`. On Android Auto it falls back to a `MessageTemplate` approximation.

```ts
import { ContactTemplate } from 'react-native-automotive';
```

## Example

```tsx
const contact = new ContactTemplate({
  name: 'Alice',
  image: require('./alice.png'),
  actions: [
    { id: 'call', title: 'Call' },
    { id: 'message', title: 'Message' },
  ],
});

Automotive.pushTemplate(contact);
```

## Source

[`packages/core/src/templates/ContactTemplate.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/templates/ContactTemplate.ts)
