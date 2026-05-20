# Navigation sessions

For turn-by-turn guidance, the `MapTemplate` exposes a navigation session API. You construct a `Trip`, hand it to `mapTemplate.startNavigationSession`, then push maneuver and travel-estimate updates as the user drives.

```ts
import { MapTemplate, Trip } from 'react-native-automotive';
```

## Creating a trip

```tsx
const trip = new Trip({
  origin: { latitude: 37.7749, longitude: -122.4194, name: 'Home' },
  destination: { latitude: 37.4419, longitude: -122.1430, name: 'Office' },
  routeChoices: [
    {
      summaryVariants: ['Fastest route', '32 min'],
      additionalInformationVariants: ['12 mi · light traffic'],
      selectionSummaryVariants: ['Fastest'],
    },
    // ... alternative routes
  ],
});
```

Each `RouteChoice` provides text variants — the system picks the variant that fits the available width.

## Starting the session

```tsx
const session = await mapTemplate.startNavigationSession(trip);
```

Returns a `NavigationSession`. Keep the reference — you call methods on it to update the in-progress nav state.

## Updating maneuvers

```ts
import { Maneuver } from 'react-native-automotive';

const turnLeft: Maneuver = {
  symbolImage: require('./turn-left.png'),
  instructionVariants: ['Turn left onto Main St', 'Left on Main'],
  initialTravelEstimates: {
    distanceRemaining: 0.3,
    distanceUnits: 'miles',
    timeRemaining: 60,
  },
};

session.updateManeuvers([turnLeft]);
```

The library resolves `symbolImage` via `Image.resolveAssetSource` and scales by the car window's pixel ratio automatically.

## Updating travel estimates

As the user drives, push fresh ETA / distance:

```ts
session.updateTravelEstimates(0 /* maneuver index */, {
  distanceRemaining: 0.1,
  distanceUnits: 'miles',
  timeRemaining: 20,
});
```

## Ending the session

| Method | Effect |
|---|---|
| `session.cancel()` | User canceled the trip (e.g. tapped "End trip"). |
| `session.finish()` | Trip completed successfully. |
| `session.pause(reason, description?)` | Trip paused (out of route, off road, etc.). |

`PauseReason` values: `'arrived'`, `'loading'`, `'locating'`, `'rerouting'`, `'proceedToRoute'`, `'noRoute'`.

## Trip previews

Before the user picks a route, show previews on the map:

```tsx
const tripA = new Trip({ ... });
const tripB = new Trip({ ... });

mapTemplate.showTripPreviews([tripA, tripB]);

// In MapTemplate config:
onStartedTrip: ({ tripId, routeIndex }) => {
  const chosen = tripId === tripA.id ? tripA : tripB;
  startNavigationSession(chosen);
},
```

## Source

[`packages/core/src/navigation/`](https://github.com/dotommy/react-native-automotive/tree/master/packages/core/src/navigation)
