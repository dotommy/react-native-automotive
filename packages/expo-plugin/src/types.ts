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
 * Android Auto app categories. Each app declares one in the manifest
 * as `<category android:name="androidx.car.app.category.<X>" />`.
 * @see https://developer.android.com/training/cars/apps#categories
 */
export type AndroidAutoCategory =
  | 'navigation'
  | 'media'
  | 'messaging'
  | 'pointofinterest'
  | 'iot';

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
   * The Android Auto category to declare. Currently informational —
   * the library's manifest hard-codes `navigation` in the CarAppService
   * intent filter; multi-category override lands in v1.1.
   * Defaults to `'navigation'` to match the library default.
   */
  androidAutoCategory?: AndroidAutoCategory;
}
