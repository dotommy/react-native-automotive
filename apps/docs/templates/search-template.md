# SearchTemplate

Search input with live results. The system provides the input field; you supply the result list as the user types.

```ts
import { SearchTemplate } from 'react-native-automotive';
```

## Example

```tsx
const search = new SearchTemplate({
  onSearch: async (query) => {
    const results = await fetchPlaces(query);
    return results.map(r => ({ text: r.name, detailText: r.address }));
  },
  onItemSelect: async ({ index }) => {
    const place = pickPlace(index);
    Automotive.pushTemplate(detailTemplate(place));
  },
  onSearchButtonPressed: () => {
    console.log('user tapped Search');
  },
});

Automotive.pushTemplate(search);
```

`onSearch` is called on every keystroke (debounced by the platform). Return a `Promise<ListItem[]>` — the platform shows a spinner until it resolves.

## Source

[`packages/core/src/templates/SearchTemplate.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/templates/SearchTemplate.ts)
