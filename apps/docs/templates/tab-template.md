# TabTemplate

**Android-only.** Android Auto's native tab strip — each tab references a separate content template by `contentId`. Distinct from the cross-platform `TabBarTemplate`, which bundles the child templates inline.

```ts
import { TabTemplate } from 'react-native-automotive';
```

## Example

```tsx
const listA = new ListTemplate({ id: 'tab-a-content', /* ... */ });
const listB = new ListTemplate({ id: 'tab-b-content', /* ... */ });

const tabs = new TabTemplate({
  headerAction: { type: 'appIcon' },
  tabs: [
    { contentId: 'tab-a-content', title: 'Recents', icon: require('./recents.png') },
    { contentId: 'tab-b-content', title: 'Saved', icon: require('./saved.png') },
  ],
  activeTabContentId: 'tab-a-content',
});

Automotive.setRootTemplate(tabs);
```

The active tab's content is looked up from the screen store by `contentId` — make sure the content templates are constructed *before* the `TabTemplate`.

## Source

[`packages/core/src/templates/android/TabTemplate.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/templates/android/TabTemplate.ts)
