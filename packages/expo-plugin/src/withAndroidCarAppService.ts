import type { ConfigPlugin } from '@expo/config-plugins';
import { AndroidConfig, withAndroidManifest } from '@expo/config-plugins';
import type { AndroidAutoCategory } from './types';

const SERVICE_NAME = 'io.automotive.rn.AutomotiveService';
const CAR_APP_SERVICE_ACTION = 'androidx.car.app.CarAppService';
const NAVIGATE_ACTION = 'androidx.car.app.action.NAVIGATE';

const CATEGORY_TO_ANDROIDX: Record<AndroidAutoCategory, string> = {
  navigation: 'androidx.car.app.category.NAVIGATION',
  poi: 'androidx.car.app.category.POI',
  iot: 'androidx.car.app.category.IOT',
  charging: 'androidx.car.app.category.CHARGING',
  weather: 'androidx.car.app.category.WEATHER',
};

/**
 * Writes the `CarAppService` intent-filter for `AutomotiveService` into the
 * consumer's `AndroidManifest.xml`, with the chosen `androidAutoCategory`.
 *
 * Replaces any previously-written `CarAppService` / `NAVIGATE` intent-filter
 * for the same service on each run, so switching `androidAutoCategory`
 * between prebuilds just works (no stale entries piling up).
 *
 * For `'navigation'` apps the plugin additionally writes the
 * `androidx.car.app.action.NAVIGATE` intent-filter (with `geo:` data scheme)
 * so the system can route navigation intents to the app.
 *
 * Background: the library's own `AndroidManifest.xml` only declares the
 * `<service>` shell + the library-internal `APP_RELOAD` intent-filter.
 * The CarAppService intent-filter is category-dependent and therefore
 * belongs in the consumer's manifest — both manifests merge at build time
 * and the consumer-side intent-filters declared here are additive to the
 * lib-side ones.
 */
export const withAndroidCarAppService = (
  category: AndroidAutoCategory,
): ConfigPlugin => (config) =>
  withAndroidManifest(config, (cfg) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    app.service = app.service ?? [];

    let service = app.service.find((s) => s.$?.['android:name'] === SERVICE_NAME);
    if (!service) {
      service = {
        $: { 'android:name': SERVICE_NAME },
      } as (typeof app.service)[number];
      app.service.push(service);
    }
    service['intent-filter'] = service['intent-filter'] ?? [];

    // Drop any previously-written CarAppService / NAVIGATE intent-filter
    // for our service so subsequent prebuilds with a different category
    // don't accumulate stale entries.
    service['intent-filter'] = service['intent-filter'].filter((f) => {
      const actions = f.action ?? [];
      return !actions.some(
        (a) =>
          a.$?.['android:name'] === CAR_APP_SERVICE_ACTION ||
          a.$?.['android:name'] === NAVIGATE_ACTION,
      );
    });

    service['intent-filter'].push({
      action: [{ $: { 'android:name': CAR_APP_SERVICE_ACTION } }],
      category: [{ $: { 'android:name': CATEGORY_TO_ANDROIDX[category] } }],
    });

    if (category === 'navigation') {
      service['intent-filter'].push({
        action: [{ $: { 'android:name': NAVIGATE_ACTION } }],
        category: [{ $: { 'android:name': 'android.intent.category.DEFAULT' } }],
        data: [{ $: { 'android:scheme': 'geo' } }],
      });
    }

    return cfg;
  });
