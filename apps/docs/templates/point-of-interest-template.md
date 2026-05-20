# PointOfInterestTemplate

Map view with a list of POIs (gas stations, charging stations, restaurants). The user can tap a POI to drill in.

```ts
import { PointOfInterestTemplate } from 'react-native-automotive';
```

## Example

```tsx
const poi = new PointOfInterestTemplate({
  title: 'Nearby charging',
  items: [
    {
      title: 'EVgo Supercharger',
      subtitle: '0.4 mi · 24 stalls available',
      latitude: 37.7749,
      longitude: -122.4194,
    },
    // ...
  ],
  onPointOfInterestSelect: ({ index }) => {
    Automotive.pushTemplate(stationDetail(index));
  },
});

Automotive.pushTemplate(poi);
```

## Source

[`packages/core/src/templates/PointOfInterestTemplate.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/templates/PointOfInterestTemplate.ts)
