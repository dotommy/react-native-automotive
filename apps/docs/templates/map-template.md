# MapTemplate

A map surface with overlay controls. The only template where you render **arbitrary React content** on the car display — your `component` prop is a full JSX tree rendered onto a native surface (`CPMapTemplate` overlay on iOS, `Surface` callback rendering a `ReactRootView` on Android).

```ts
import { MapTemplate } from 'react-native-automotive';
```

## Quick example

```tsx
import MapView from 'react-native-maps';

function CarMap() {
  return (
    <MapView style={{ flex: 1 }} initialRegion={{ /* ... */ }} />
  );
}

const mapTemplate = new MapTemplate({
  component: CarMap,
  mapButtons: [
    { id: 'recenter', image: require('./recenter.png') },
    { id: 'layers', image: require('./layers.png') },
  ],
  onMapButtonPressed: ({ id }) => {
    if (id === 'recenter') recenterMap();
  },
});

Automotive.setRootTemplate(mapTemplate);
```

The `component` is registered with `AppRegistry` under the template id and rendered by the native side onto the car's map surface. It runs in the same JS context as the rest of your app — props can be passed via context or Redux, state updates re-render normally (no rate limit on the map surface — only on the *controls*).

## Config

| Prop | Type | Required | Platform | Description |
|---|---|:-:|:-:|---|
| `component` | `React.ComponentType<any>` | yes | both | Your JSX tree rendered on the map surface. |
| `guidanceBackgroundColor` | `string` | no | iOS | Background color of the guidance bar during nav. |
| `tripEstimateStyle` | `'dark' \| 'light'` | no | iOS | Trip estimate text style. Default `'dark'`. |
| `mapButtons` | `MapButton[]` | no | both | Up to 4 buttons in the bottom-right. |
| `automaticallyHidesNavigationBar` | `boolean` | no | iOS | Hides nav bar on inactivity. |
| `hidesButtonsWithNavigationBar` | `boolean` | no | iOS | Hides map buttons when nav bar hides. |
| `header` | `Header` | no | Android | Template header config. |
| `items` | `ListItem[]` | no | Android | Side list of POIs to show with the map. |
| `actions` | `Action[]` | no | Android | Bottom action strip (up to 4). |
| `pane` | `Pane` | no | Android | Side pane with key-value content. |
| `onAlertActionPressed` | `(e: { secondary?, primary? }) => void` | no | both | Nav alert action pressed. |
| `onMapButtonPressed` | `(e: { id, template }) => void` | no | both | Map button tapped. |
| `onPanWithDirection` | `(e: { direction }) => void` | no | both | Panning gesture. |
| `onPanBeganWithDirection` | `(e: { direction }) => void` | no | both | Pan started. |
| `onPanEndedWithDirection` | `(e: { direction }) => void` | no | both | Pan ended. |
| `onSelectedPreviewForTrip` | `(e: { tripId, routeIndex }) => void` | no | both | Trip preview selected. |
| `onDidCancelNavigation` | `() => void` | no | both | User canceled active navigation. |
| `onStartedTrip` | `(e: { tripId, routeIndex }) => void` | no | both | User chose a trip from previews. |

## Navigation methods

`MapTemplate` is the gateway to the navigation session API:

```ts
const session = await mapTemplate.startNavigationSession(trip);
session.updateManeuvers([...]);
session.updateTravelEstimates(0, { /* ... */ });
session.cancel(); // or session.finish() / session.pause(reason)
```

See [Navigation sessions](/guide/navigation-sessions) for the full session API.

## Other methods

| Method | Effect |
|---|---|
| `updateConfig(config)` | Replace config in place. |
| `updateMapButtons(buttons)` | Replace map buttons. |
| `updateTravelEstimates(trip, estimates, timeRemainingColor?)` | Push updated ETA / distance. |
| `showTripPreviews(trips, textConfig?)` | Show selectable trip previews. |
| `hideTripPreviews()` | Hide them. |
| `showRouteChoicesPreviewForTrip(trip, textConfig?)` | Show route alternatives. |
| `presentNavigationAlert(config, animated?)` | Show nav-specific alert. |
| `dismissNavigationAlert(animated?)` | Hide it. |
| `showPanningInterface(animated?)` | Enter pan mode (hides map buttons). |
| `dismissPanningInterface(animated?)` | Exit pan mode. |

## Source

[`packages/core/src/templates/MapTemplate.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/templates/MapTemplate.ts)
