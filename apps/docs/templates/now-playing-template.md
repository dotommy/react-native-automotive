# NowPlayingTemplate

The system "Now Playing" template — track artwork, play/pause/skip controls, scrub bar. **iOS only**: Android Auto handles media via `MediaBrowserServiceCompat`, a different pipeline not covered by this library.

```ts
import { NowPlayingTemplate, Automotive } from 'react-native-automotive';
```

## Example

```tsx
Automotive.enableNowPlaying(true);

const np = new NowPlayingTemplate({
  // most fields configured via the iOS MediaPlayer framework — this template
  // exposes only the button strip overlay.
  albumArtistButtonEnabled: true,
  upNextButtonEnabled: true,
  onUpNextButtonPressed: () => showQueue(),
});

Automotive.pushTemplate(np);
```

## Platform note

Android Auto: `pushTemplate(np)` is a no-op (the template renders nothing). For an Android Auto media app, write a separate `MediaBrowserService` — a companion package is on the post-v1 roadmap.

## Source

[`packages/core/src/templates/NowPlayingTemplate.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/templates/NowPlayingTemplate.ts)
