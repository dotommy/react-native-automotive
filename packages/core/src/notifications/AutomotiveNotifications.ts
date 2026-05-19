import {
  Image,
  NativeEventEmitter,
  NativeModule,
  NativeModules,
} from 'react-native';
import type {
  NotificationActionEvent,
  NotificationConfig,
} from './types';

interface InternalNotifications extends NativeModule {
  send(config: object): Promise<string>;
}

const { AutomotiveNotifications: native } = NativeModules as {
  AutomotiveNotifications: InternalNotifications;
};

const emitter = new NativeEventEmitter(native);

export type NotificationActionListener = (
  event: NotificationActionEvent,
) => void;

/**
 * Public API for sending system notifications that appear both on the
 * phone and projected onto the connected CarPlay / Android Auto display.
 *
 * Module separate from the template stack (see BRIEF: "Le notifiche
 * sono un modulo separato dai template").
 *
 * Usage:
 * ```typescript
 * import { AutomotiveNotifications } from 'react-native-automotive'
 *
 * const id = await AutomotiveNotifications.send({
 *   title: 'Mario Rossi',
 *   body: 'Ciao, arrivo!',
 *   sender: { name: 'Mario Rossi', avatar: require('./mario.png') },
 *   actions: [
 *     { id: 'reply', label: 'Rispondi', type: 'voice' },
 *     { id: 'ok',    label: '👍 Ok!',   type: 'quick_reply' },
 *   ],
 * })
 *
 * const off = AutomotiveNotifications.addActionListener(({ notificationId, actionId, response }) => {
 *   console.log('action tapped', { notificationId, actionId, response })
 * })
 * // ...later: off()
 * ```
 *
 * **Permissions** are not handled by this module — the consumer is
 * expected to request notification permissions separately (iOS via
 * `UNUserNotificationCenter` or a library such as
 * `react-native-permissions`; Android 13+ via `POST_NOTIFICATIONS`).
 *
 * **Background action handling** (taps while the app is fully killed)
 * requires native delegate wiring that lives in the consumer app's
 * `AppDelegate` / `AndroidManifest`. The Step 9 Expo Config Plugin
 * generates that wiring automatically; until then, action events only
 * fire when the app is foreground or in background-but-alive state.
 */
class AutomotiveNotificationsClass {
  /**
   * Sends a system notification.
   *
   * The `sender.avatar` (if provided) is resolved to a native image
   * source before crossing the bridge.
   *
   * @returns the notification id, echoed back in action events and
   *   usable by future cancel/update APIs.
   */
  public send(config: NotificationConfig): Promise<string> {
    const normalized = JSON.parse(JSON.stringify(config));
    if (config.sender?.avatar) {
      normalized.sender.avatar = Image.resolveAssetSource(config.sender.avatar);
    }
    return native.send(normalized);
  }

  /**
   * Subscribes to action button taps.
   *
   * @returns a function that removes the listener when called.
   */
  public addActionListener(
    listener: NotificationActionListener,
  ): () => void {
    const subscription = emitter.addListener('actionPressed', listener);
    return () => subscription.remove();
  }
}

export const AutomotiveNotifications = new AutomotiveNotificationsClass();
