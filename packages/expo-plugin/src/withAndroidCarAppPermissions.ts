import type { ConfigPlugin } from '@expo/config-plugins';
import { AndroidConfig, withAndroidManifest } from '@expo/config-plugins';

/**
 * Adds the `androidx.car.app.*` permissions required for the library's
 * `CarAppService` to operate. Android requires the consumer app's
 * manifest to declare these permissions explicitly — they cannot be
 * inherited from the library's own manifest via merge alone (Android
 * intentionally requires apps to opt in to permissions).
 *
 * Idempotent: re-running `expo prebuild` doesn't duplicate the
 * permission entries (`addUsesPermission` checks for existing).
 */
const REQUIRED_PERMISSIONS = [
  'androidx.car.app.NAVIGATION_TEMPLATES',
  'androidx.car.app.MAP_TEMPLATES',
  'androidx.car.app.ACCESS_SURFACE',
  // Wake lock is requested by the lib's AutomotiveService and merged
  // automatically, but listing it here keeps everything in one place.
  'android.permission.WAKE_LOCK',
];

export const withAndroidCarAppPermissions: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (cfg) => {
    for (const permission of REQUIRED_PERMISSIONS) {
      AndroidConfig.Permissions.addPermission(cfg.modResults, permission);
    }
    return cfg;
  });
};
