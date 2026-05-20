# Notifications

The `AutomotiveNotifications` module sends system notifications that appear on the **phone** and project onto the **car display**. Users can tap action buttons (or speak into a dictation field) and the response reaches your JS — **even when the app is fully terminated**, provided the Expo plugin is installed (it wires the OS-level delegate that catches taps before your process is rehydrated).

This is the cross-platform answer to "messaging" on Android Auto: instead of a `CarAppService` template, Android Auto routes messaging-style notifications via `NotificationCompat.CarExtender`, which this module uses under the hood.

```ts
import { AutomotiveNotifications } from 'react-native-automotive';
```

## Sending a notification

```ts
const id = await AutomotiveNotifications.send({
  title: 'Mario Rossi',
  body: 'Ciao, arrivo!',
  sender: {
    name: 'Mario Rossi',
    avatar: require('./mario.png'),
  },
  conversationId: 'chat-with-mario',
  actions: [
    { id: 'reply', label: 'Reply', type: 'voice', placeholder: 'Reply…' },
    { id: 'ok',    label: '👍 OK', type: 'quick_reply' },
  ],
});
```

`send()` returns a promise that resolves with the **notification id** — store it to correlate with later action events.

## Receiving action taps

```ts
import { useEffect } from 'react';
import { AutomotiveNotifications } from 'react-native-automotive';

useEffect(() => {
  const off = AutomotiveNotifications.addActionListener(
    ({ notificationId, actionId, response }) => {
      if (actionId === 'ok') markAsRead(notificationId);
      if (actionId === 'reply') sendReply(notificationId, response);
    },
  );
  return off;
}, []);
```

For `'voice'` actions, `response` contains the dictated text. For `'quick_reply'`, `response` is `undefined`.

## Permissions

The module **does not request OS permissions** — that's your app's responsibility. Use [`expo-notifications`](https://docs.expo.dev/versions/latest/sdk/notifications/) (Expo) or [`react-native-permissions`](https://github.com/zoontek/react-native-permissions) (bare).

- **iOS**: `UNUserNotificationCenter.requestAuthorization`
- **Android 13+**: `POST_NOTIFICATIONS` runtime permission

Send a notification without permission and the platform silently swallows it.

## What "background" means here

The Expo plugin injects this into your `AppDelegate.swift`:

```swift
NotificationsDelegate.install()
```

That call registers the library's `UNUserNotificationCenterDelegate` early enough in the launch sequence that **action taps on notifications fire even when your app was fully terminated when the user tapped**. The OS rehydrates the process, the delegate catches the tap, the action event reaches JS as soon as the bridge is up.

On Android, the same mechanism works via the manifest-declared `AutomotiveNotificationsReceiver` (also written automatically by the lib's own `AndroidManifest.xml`).

Without the plugin, taps work only when the app is in foreground or background-but-alive — see [Bare RN setup](/guide/setup-bare) for manual wiring instructions.

## Config reference

### `NotificationConfig`

| Field | Type | Required | Description |
|---|---|:-:|---|
| `title` | `string` | yes | The notification title (typically sender name). |
| `body` | `string` | yes | The notification body (message content). |
| `conversationId` | `string` | no | Groups notifications threaded in the car UI. |
| `sender` | `NotificationSender` | yes | Sender identity. |
| `actions` | `NotificationAction[]` | no | Up to 4 action buttons. |

### `NotificationSender`

| Field | Type | Required | Description |
|---|---|:-:|---|
| `name` | `string` | yes | Display name shown in the notification. |
| `avatar` | `ImageSourcePropType` | no | `require(...)` or `{ uri: '...' }`. Resolved to UIImage / IconCompat at the bridge. |

Required because Apple's CarPlay messaging pipeline is built on `INSendMessageIntent`, which mandates an `INPerson`. Android mirrors the field for API symmetry.

### `NotificationAction`

| Field | Type | Required | Description |
|---|---|:-:|---|
| `id` | `string` | yes | Stable id echoed in action events. |
| `label` | `string` | yes | Button label (e.g. "Reply", "👍 OK"). |
| `type` | `'voice' \| 'quick_reply'` | yes | `voice` opens dictation; `quick_reply` is a plain tap. |
| `placeholder` | `string` | no | Placeholder text in the dictation UI (only for `voice`). |

### `NotificationActionEvent`

| Field | Type | Description |
|---|---|---|
| `notificationId` | `string` | The id returned by `send()`. |
| `actionId` | `string` | The action's `id` field. |
| `response` | `string \| undefined` | Dictated text for `voice` actions; `undefined` for `quick_reply`. |

## Source

[`packages/core/src/notifications/`](https://github.com/dotommy/react-native-automotive/tree/master/packages/core/src/notifications)
