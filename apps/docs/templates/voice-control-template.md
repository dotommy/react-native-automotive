# VoiceControlTemplate

::: warning Experimental
Import from `react-native-automotive/experimental`. Not part of the v1 supported surface — API may change without a major version bump.
:::

**iOS only.** Displays a voice control indicator over the CarPlay screen during audio input. CarPlay navigation apps are effectively required to show this template when reacting to voice prompts.

```ts
import { VoiceControlTemplate } from 'react-native-automotive/experimental';
```

## Example

```tsx
const voice = new VoiceControlTemplate({
  voiceControlStates: [
    { identifier: 'listening', titleVariants: ['Listening...'] },
    { identifier: 'processing', titleVariants: ['Processing...'] },
  ],
});

Automotive.presentTemplate(voice);
voice.activateVoiceControlState('listening');
```

The natural home for this is a future companion package (e.g. `react-native-automotive-sirikit`); until that ships, it lives here as an opt-in.

## Source

[`packages/core/src/experimental/VoiceControlTemplate.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/experimental/VoiceControlTemplate.ts)
