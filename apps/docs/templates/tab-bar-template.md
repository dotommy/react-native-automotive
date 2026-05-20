# TabBarTemplate

Root-only template that displays a tab bar at the top of the car screen. Each tab points to a child template (typically `ListTemplate`, `GridTemplate`, `InformationTemplate`, or `PointOfInterestTemplate`).

```ts
import { TabBarTemplate } from 'react-native-automotive';
```

## Example

```tsx
const recents = new ListTemplate({ title: 'Recents', items: [...] });
const favorites = new ListTemplate({ title: 'Favorites', items: [...] });
const nearby = new ListTemplate({ title: 'Nearby', items: [...] });

const tabs = new TabBarTemplate({
  title: 'My app',
  templates: [recents, favorites, nearby],
  onTemplateSelect: (template, e) => {
    console.log('switched to', template?.id);
  },
});

Automotive.setRootTemplate(tabs);
```

Root-only: `pushTemplate(tabs)` won't compile.

## Source

[`packages/core/src/templates/TabBarTemplate.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/templates/TabBarTemplate.ts) · full prop reference in JSDoc.

::: tip On Android Auto
On Android the dedicated `TabTemplate` (Android-only, with `contentId`-based routing) is often a better fit — see [TabTemplate](/templates/tab-template).
:::
