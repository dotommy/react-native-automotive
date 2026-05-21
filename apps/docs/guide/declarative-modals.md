# `<Alert>` and `<ActionSheet>` (declarative)

Declarative wrappers for [`AlertTemplate`](/templates/alert-template) and [`ActionSheetTemplate`](/templates/action-sheet-template). Both are **modals**: their React lifecycle maps directly to the platform present/dismiss cycle.

```ts
import { Automotive, Alert, ActionSheet } from 'react-native-automotive';
```

## Modal lifecycle pattern

Same as any React modal: render conditionally inside `<Automotive.Root>`. When the condition flips:

- `false → true`: React mounts the component → reconciler calls `Automotive.presentTemplate(...)`
- `true → false`: React unmounts → reconciler calls `Automotive.dismissTemplate()`

You don't call `presentTemplate` or `dismissTemplate` manually. State drives the modal.

## `<Alert>` example

```tsx
function TripScreen() {
  const [confirming, setConfirming] = useState(false);

  return (
    <Automotive.Root>
      <List title="Active trip">
        <List.Section header="Actions">
          <List.Item text="Cancel trip" onPress={() => setConfirming(true)} />
        </List.Section>
      </List>

      {confirming && (
        <Alert title="Cancel the trip?">
          <Alert.Action
            title="Keep going"
            style="cancel"
            onPress={() => setConfirming(false)}
          />
          <Alert.Action
            title="Cancel trip"
            style="destructive"
            onPress={() => {
              cancelTrip();
              setConfirming(false);
            }}
          />
        </Alert>
      )}
    </Automotive.Root>
  );
}
```

## `<ActionSheet>` example

Like `<Alert>` but for picking among several actions. Use when you have 3-5 choices, not yes/no.

```tsx
function MapScreen() {
  const [showShare, setShowShare] = useState(false);

  return (
    <Automotive.Root>
      <List title="Map">
        <List.Section header="Actions">
          <List.Item text="Share location" onPress={() => setShowShare(true)} />
        </List.Section>
      </List>

      {showShare && (
        <ActionSheet title="Share location" message="Choose how">
          <ActionSheet.Action title="Text message" onPress={() => { shareSMS(); setShowShare(false); }} />
          <ActionSheet.Action title="Email" onPress={() => { shareEmail(); setShowShare(false); }} />
          <ActionSheet.Action title="Cancel" style="cancel" onPress={() => setShowShare(false)} />
        </ActionSheet>
      )}
    </Automotive.Root>
  );
}
```

## Props reference

### `<Alert>`

| Prop | Type | Description |
|---|---|---|
| `title` | `string` | Convenience: maps to `titleVariants: [title]`. |
| `titleVariants` | `string[]` | Localized title variants, ordered most-to-least preferred. |
| `children` | `<Alert.Action>` only | Required. |

### `<ActionSheet>`

| Prop | Type | Required | Description |
|---|---|:-:|---|
| `title` | `string` | yes | Sheet title. |
| `message` | `string` | no | Optional secondary text. |
| `children` | `<ActionSheet.Action>` only | yes | Required. |

### `<Alert.Action>` / `<ActionSheet.Action>`

Same shape for both:

| Prop | Type | Required | Description |
|---|---|:-:|---|
| `title` | `string` | yes | Button label. |
| `style` | `'default' \| 'cancel' \| 'destructive'` | no | Default `'default'`. `cancel` is highlighted as the back-out choice; `destructive` is red. |
| `onPress` | `() => void` | no | Fired when tapped. Typically calls `setState` to dismiss. |

## Always call `setState` in `onPress`

The platform doesn't auto-dismiss when the user taps an action. Always include the dismiss logic in `onPress`:

```tsx
<Alert.Action
  title="OK"
  onPress={() => {
    doTheThing();
    setShowAlert(false);  // ← unmount the <Alert>, which dismisses
  }}
/>
```

Otherwise the alert stays presented until something else unmounts it.

## Only one modal at a time

The platforms only allow **one modal at a time**. If you try to mount two modals simultaneously (e.g. two `<Alert>`s), the second's `presentTemplate` will be a no-op or replace the first depending on platform.

If you need a sequence ("confirm A, then ask about B"), drive it with state:

```tsx
const [step, setStep] = useState<'idle' | 'confirmA' | 'confirmB'>('idle');

return (
  <Automotive.Root>
    {/* ... */}
    {step === 'confirmA' && (
      <Alert title="A?">
        <Alert.Action title="Yes" onPress={() => setStep('confirmB')} />
        <Alert.Action title="No" style="cancel" onPress={() => setStep('idle')} />
      </Alert>
    )}
    {step === 'confirmB' && (
      <Alert title="B?">
        <Alert.Action title="Yes" onPress={() => { doAB(); setStep('idle'); }} />
        <Alert.Action title="No" style="cancel" onPress={() => setStep('idle')} />
      </Alert>
    )}
  </Automotive.Root>
);
```

## Source

- [`packages/core/src/declarative/Alert.tsx`](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/declarative/Alert.tsx)
- [`packages/core/src/declarative/ActionSheet.tsx`](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/declarative/ActionSheet.tsx)
