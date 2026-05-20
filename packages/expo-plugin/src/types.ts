/**
 * Apple CarPlay app categories. The user picks one — Apple requires a
 * single `com.apple.developer.carplay-<category>` entitlement per app.
 * @see https://developer.apple.com/documentation/carplay/requesting_carplay_entitlements
 */
export type CarPlayCategory =
  | 'navigation'
  | 'audio'
  | 'communication' // VoIP / messaging — Apple's umbrella
  | 'messaging'
  | 'parking'
  | 'fuel'
  | 'driving-task'
  | 'ev'
  | 'quick-food-ordering';

/**
 * Categories supported by the `androidx.car.app` (`CarAppService`) pipeline
 * on Android Auto. Each app declares one in the manifest as
 * `<category android:name="androidx.car.app.category.<X>" />` inside the
 * `CarAppService` intent-filter.
 *
 * **Not exhaustive of all Android Auto app types**:
 * - `media` apps (Spotify, podcasts) use `MediaBrowserServiceCompat`,
 *   a separate pipeline not handled by this plugin. A companion package
 *   for media is on the roadmap (post-v1).
 * - `messaging` apps use `NotificationCompat.CarExtender` with `RemoteInput`,
 *   also not a `CarAppService` category — the
 *   {@link react-native-automotive!AutomotiveNotifications | AutomotiveNotifications}
 *   module already covers this cross-platform.
 *
 * @see https://developer.android.com/training/cars/apps#categories
 */
export type AndroidAutoCategory =
  | 'navigation'
  | 'poi'
  | 'iot'
  | 'charging'
  | 'weather';

/**
 * Plugin options passed in the consumer's `app.config.js`:
 *
 * ```js
 * plugins: [
 *   ['react-native-automotive-expo-plugin', {
 *     carPlayCategory: 'navigation',
 *     androidAutoCategory: 'navigation',
 *   }]
 * ]
 * ```
 */
export interface AutomotivePluginOptions {
  /**
   * The CarPlay entitlement to request from Apple. Required for the
   * plugin to add `com.apple.developer.carplay-<category>` to the
   * iOS Entitlements file.
   */
  carPlayCategory: CarPlayCategory;

  /**
   * The category to declare in the `CarAppService` intent-filter. Drives
   * what kind of Android Auto app the system sees you as (navigation,
   * point-of-interest, IoT, charging, weather).
   *
   * If `'navigation'`, the plugin additionally writes the
   * `androidx.car.app.action.NAVIGATE` intent-filter so the system can
   * route `geo:` navigation requests to your app.
   *
   * Defaults to `'navigation'`.
   */
  androidAutoCategory?: AndroidAutoCategory;
}
