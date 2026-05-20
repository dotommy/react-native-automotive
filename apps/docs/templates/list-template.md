# ListTemplate

A hierarchical list of items, optionally grouped into sections. The bread-and-butter template — most car apps are mostly lists.

```ts
import { ListTemplate } from 'react-native-automotive';
```

## Quick example

```tsx
const list = new ListTemplate({
  title: 'Recent trips',
  sections: [
    {
      header: 'This week',
      items: [
        { text: 'Home → Office', detailText: '12 miles · 28 min' },
        { text: 'Office → Lunch', detailText: '3 miles · 9 min' },
      ],
    },
    {
      header: 'Last week',
      items: [
        { text: 'Home → Airport', detailText: '24 miles · 41 min' },
      ],
    },
  ],
  onItemSelect: async ({ index }) => {
    console.log('selected', index);
  },
});

Automotive.setRootTemplate(list);
```

## Constructor

```ts
new ListTemplate(config: ListTemplateConfig)
```

## Config

| Prop | Type | Required | Platform | Description |
|---|---|:-:|:-:|---|
| `title` | `string` | no | both | Title shown in the navigation bar. |
| `sections` | `ListSection[]` | no | both | Sectioned list. Mutually exclusive with `items`. |
| `items` | `ListItem[]` | no | Android | Single flat list. Mutually exclusive with `sections`. |
| `emptyViewTitleVariants` | `string[]` | no | iOS | Localized title variants for the empty state. The system picks the first that fits. |
| `emptyViewSubtitleVariants` | `string[]` | no | iOS | Localized subtitle variants for the empty state. |
| `onItemSelect` | `(item: { templateId, index }) => Promise<void>` | no | both | Fired on item tap. Show a spinner until the returned promise resolves. |
| `onImageRowItemSelect` | `(item: { templateId, index, imageIndex }) => Promise<void>` | no | both | Fired when an image row's image is tapped. |
| `onBackButtonPressed` | `() => void` | no | both | Fired when the back button is pressed. |
| `backButtonHidden` | `boolean` | no | both | Hide the back button. Default `false`. |
| `assistant` | `{ enabled, position, visibility, action }` | no | iOS | Siri assistant integration. See [Apple docs](https://developer.apple.com/documentation/carplay/cplisttemplate#3762508). |
| `loading` | `boolean` | no | Android | Show a loading indicator instead of the list. |
| `headerAction` | `Action<'appIcon' \| 'back'>` | no | Android | The Action displayed in the template header. |
| `actions` | `[Action<'custom'>] \| [Action<'custom'>, Action<'custom'>]` | no | Android | Up to 2 actions in the bottom action strip. |

Plus the standard [TemplateConfig fields](/guide/imperative-api): `id`, `leadingNavigationBarButtons`, `trailingNavigationBarButtons`, `tabSystemItem`, `tabSystemImageName`, `tabImage`, `tabTitle`, `onWillAppear`, `onWillDisappear`, `onDidAppear`, `onDidDisappear`, `onBarButtonPressed`.

## `ListSection`

```ts
interface ListSection {
  header: string;
  items: ListItem[];
}
```

## `ListItem`

```ts
interface ListItem {
  text: string;
  detailText?: string;
  image?: ImageSourcePropType;
  imgRowImages?: ImageSourcePropType[];
  isPlaying?: boolean;
  playingIndicatorLocation?: 'leading' | 'trailing';
  showsDisclosureIndicator?: boolean;
  // ...
}
```

See the [`ListItem` interface source](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/interfaces/ListItem.ts) for the full surface.

## Methods

### `updateSections(sections: ListSection[])`

Replace all sections in place. Use sparingly — CarPlay rate-limits list updates to roughly one per second.

```ts
const list = new ListTemplate({ sections: initial, ... });
// later
list.updateSections(newSections);
```

### `updateListTemplateItem(item: ListItemUpdate)`

Update a single item. More efficient than `updateSections` when only one row changes.

```ts
list.updateListTemplateItem({
  sectionIndex: 0,
  itemIndex: 3,
  ...newItemData,
});
```

### Maximum-limit getters

Both platforms cap how many items/sections/images a list can show. Query at runtime:

```ts
const maxItems = await list.getMaximumListItemCount();
const maxSections = await list.getMaximumListSectionCount();
const maxImageSize = await list.getMaximumListItemImageSize();
const maxGridImages = await list.getMaximumNumberOfGridImages();
const maxImageRowSize = await list.getMaximumListImageRowItemImageSize();
```

The exact caps depend on the head unit — same iPhone, different car, different limit. Always query rather than hardcoding.

## Platform notes

### iOS
- Supports sectioned lists via `sections`. The `items` flat field is ignored.
- Apple's `CPListTemplate` supports up to 5 levels of nesting (push deeper lists onto the stack).
- Image row items (`imgRowImages`) render as a horizontal scrollable strip.

### Android
- Supports both `sections` and `items` (single list).
- Apply `headerAction: { type: 'appIcon' }` or `{ type: 'back' }` to render the standard header.
- Use `loading: true` while fetching data — the platform renders its own spinner.

## When to use which

| Want… | Use |
|---|---|
| A menu of categories | `ListTemplate` with sections |
| A long flat list (search results) | `ListTemplate` with `items` |
| A grid of icons (audio sources, etc.) | [`GridTemplate`](/templates/grid-template) |
| A tabbed list (recent / favorites / nearby) | [`TabBarTemplate`](/templates/tab-bar-template) → ListTemplate per tab |

## Source

[`packages/core/src/templates/ListTemplate.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/templates/ListTemplate.ts)
