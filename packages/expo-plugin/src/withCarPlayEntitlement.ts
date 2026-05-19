import type { ConfigPlugin } from '@expo/config-plugins';
import { withEntitlementsPlist } from '@expo/config-plugins';
import type { CarPlayCategory } from './types';

/**
 * Adds the appropriate `com.apple.developer.carplay-<category>`
 * entitlement to the iOS Entitlements plist.
 *
 * Apple requires this entitlement to be requested manually via the
 * Apple Developer portal — the plugin only writes the local
 * Entitlements file. Without explicit approval from Apple, the app
 * will fail to provision for distribution but the entitlement is
 * still needed locally for the Debug build to compile and run on
 * simulator / CarPlay simulator.
 *
 * Only one CarPlay entitlement may be present per app — Apple
 * rejects multi-entitlement apps in App Store Review.
 */
export const withCarPlayEntitlement = (
  category: CarPlayCategory,
): ConfigPlugin => {
  return (config) => {
    return withEntitlementsPlist(config, (cfg) => {
      const key = `com.apple.developer.carplay-${category}`;
      cfg.modResults = {
        ...cfg.modResults,
        [key]: true,
      };
      return cfg;
    });
  };
};
