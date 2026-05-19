import type { ImageSourcePropType } from 'react-native';

/**
 * The "from" identity attached to a notification.
 *
 * Required because Apple's CarPlay notification pipeline is built on
 * `INSendMessageIntent`, which mandates a sender (INPerson). Android
 * uses the same field for `NotificationCompat.MessagingStyle.Person`
 * to keep the API symmetric.
 */
export interface NotificationSender {
  /** Display name shown in the notification (e.g. "Mario Rossi"). */
  name: string;
  /**
   * Optional avatar. JS pass an `ImageSourcePropType` (require(...) or
   * { uri: '...' }) — the native side resolves it to a `UIImage` /
   * Android `IconCompat`.
   */
  avatar?: ImageSourcePropType;
}

/**
 * Kind of action button to render on the notification.
 *
 * - `quick_reply`: a plain tap-to-dismiss button (e.g. "👍 Ok!"). Emits
 *   `actionPressed` with `{ actionId }`.
 * - `voice`: a button that opens a dictation UI; the user speaks, the
 *   transcribed text is sent back via the event's `response` field.
 */
export type NotificationActionType = 'voice' | 'quick_reply';

export interface NotificationAction {
  /** Stable id echoed back when the user taps this action. */
  id: string;
  /** Label shown on the button (e.g. "Rispondi", "👍 Ok!"). */
  label: string;
  /** Action behaviour. See {@link NotificationActionType}. */
  type: NotificationActionType;
  /**
   * Placeholder text shown in the dictation input UI.
   * Only meaningful when `type === 'voice'`.
   */
  placeholder?: string;
}

/**
 * Notification payload passed to {@link AutomotiveNotifications.send}.
 */
export interface NotificationConfig {
  /** Notification title (typically the sender name). */
  title: string;
  /** Notification body (the message content). */
  body: string;
  /**
   * Optional conversation grouping identifier — notifications with the
   * same `conversationId` are grouped by the system into a single
   * threaded view on the car display.
   */
  conversationId?: string;
  /**
   * Sender identity. Required by Apple's CarPlay messaging pipeline
   * (INSendMessageIntent must have an INPerson); Android mirrors it
   * for API parity.
   */
  sender: NotificationSender;
  /**
   * Action buttons displayed under the notification body. Maximum 4
   * across both platforms (iOS hard limit, Android shows up to 4).
   */
  actions?: NotificationAction[];
}

/**
 * Payload delivered to {@link AutomotiveNotifications.addActionListener}
 * when the user taps an action button.
 *
 * Note: this event only fires when the app is foreground/background.
 * For taps that happen while the app is fully killed, the host OS
 * needs additional wiring (Step 9 of the BRIEF roadmap — the Expo
 * Config Plugin generates the AppDelegate / AndroidManifest entries).
 */
export interface NotificationActionEvent {
  /** The notification's id returned by `send()`. */
  notificationId: string;
  /** The action's id from {@link NotificationAction.id}. */
  actionId: string;
  /**
   * The dictated text. Present only when the tapped action was of
   * type `voice`. `undefined` for `quick_reply`.
   */
  response?: string;
}
