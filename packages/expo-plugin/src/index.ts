import type { ConfigPlugin } from '@expo/config-plugins';
import { withPlugins } from '@expo/config-plugins';
import type { AutomotivePluginOptions } from './types';
import { withCarPlayScene } from './withCarPlayScene';
import { withCarPlayEntitlement } from './withCarPlayEntitlement';
import { withNotificationsDelegate } from './withNotificationsDelegate';
import { withAndroidCarAppPermissions } from './withAndroidCarAppPermissions';

export type { AutomotivePluginOptions, CarPlayCategory, AndroidAutoCategory } from './types';

/**
 * Expo Config Plugin for `react-native-automotive`.
 *
 * During `expo prebuild`, configures the native projects so that the
 * library's CarPlay / Android Auto / notifications features work end
 * to end without manual editing of Info.plist, Entitlements,
 * AppDelegate, or AndroidManifest by the consumer.
 *
 * Usage in `app.config.js`:
 * ```js
 * export default {
 *   plugins: [
 *     ['react-native-automotive-expo-plugin', {
 *       carPlayCategory: 'navigation',
 *       androidAutoCategory: 'navigation',
 *     }],
 *   ],
 * }
 * ```
 *
 * What it does:
 * - **iOS Info.plist**: registers a CarPlay scene pointing at the
 *   library's `RNAutomotiveSceneDelegate`.
 * - **iOS Entitlements**: adds `com.apple.developer.carplay-<category>`
 *   based on `carPlayCategory`.
 * - **iOS AppDelegate**: injects `RNAutomotiveNotificationsDelegate.install()`
 *   so action button taps on notifications reach JS.
 * - **Android Manifest**: adds the `androidx.car.app.*` permissions.
 *
 * What it does NOT do (out of scope for v1):
 * - Auto-detect features (you declare `carPlayCategory` explicitly).
 * - Request notification permissions at runtime (use a permissions
 *   library separately).
 * - Override the library's hard-coded Android Auto category
 *   `NAVIGATION` (multi-category support lands in v1.1).
 */
const withAutomotive: ConfigPlugin<AutomotivePluginOptions> = (config, options) => {
  if (!options || !options.carPlayCategory) {
    throw new Error(
      '[react-native-automotive] `carPlayCategory` is required. ' +
        'Set it in the plugin options, e.g. ' +
        "['react-native-automotive-expo-plugin', { carPlayCategory: 'navigation' }]",
    );
  }

  return withPlugins(config, [
    // iOS
    withCarPlayScene,
    withCarPlayEntitlement(options.carPlayCategory),
    withNotificationsDelegate,
    // Android
    withAndroidCarAppPermissions,
  ]);
};

export default withAutomotive;
