import type { ConfigPlugin, InfoPlist } from '@expo/config-plugins';
import { withInfoPlist } from '@expo/config-plugins';

/**
 * Module name used by Swift when consumed by an Expo / RN app — derived
 * from the pod name `react-native-automotive` by replacing hyphens with
 * underscores (CocoaPods convention). This is what `<module>-Swift.h`
 * resolves to and what the `UISceneDelegateClassName` string must
 * reference.
 */
const SWIFT_MODULE = 'react_native_automotive';
const SCENE_DELEGATE = 'RNAutomotiveSceneDelegate';
const CARPLAY_ROLE = 'CPTemplateApplicationSceneSessionRoleApplication';
const SCENE_CONFIG_NAME = 'CarPlay';

/**
 * Adds a `UIApplicationSceneManifest` entry to Info.plist that registers
 * a CarPlay scene pointing at the library-provided
 * `RNAutomotiveSceneDelegate`.
 *
 * Without this entry, iOS does not deliver CarPlay scene connect /
 * disconnect callbacks and the library's connection lifecycle never
 * fires — the JS `useCarPlay()` hook never sees `isConnected: true`.
 *
 * Idempotent: if a scene manifest already exists, we merge in the
 * CarPlay role rather than overwriting the user's other scene configs
 * (e.g. their phone scene).
 */
export const withCarPlayScene: ConfigPlugin = (config) => {
  return withInfoPlist(config, (cfg) => {
    cfg.modResults = injectCarPlayScene(cfg.modResults);
    return cfg;
  });
};

function injectCarPlayScene(plist: InfoPlist): InfoPlist {
  const sceneDelegate = `${SWIFT_MODULE}.${SCENE_DELEGATE}`;
  const carPlaySceneEntry = {
    UISceneConfigurationName: SCENE_CONFIG_NAME,
    UISceneDelegateClassName: sceneDelegate,
  };

  const manifest = (plist.UIApplicationSceneManifest ?? {}) as Record<string, unknown>;
  const configurations =
    (manifest.UISceneConfigurations as Record<string, unknown>) ?? {};
  const existingCarPlay = (configurations[CARPLAY_ROLE] as unknown[] | undefined) ?? [];

  const alreadyPresent = existingCarPlay.some(
    (entry) =>
      typeof entry === 'object' &&
      entry !== null &&
      (entry as { UISceneDelegateClassName?: string }).UISceneDelegateClassName ===
        sceneDelegate,
  );

  const nextCarPlay = alreadyPresent
    ? existingCarPlay
    : [...existingCarPlay, carPlaySceneEntry];

  return {
    ...plist,
    UIApplicationSceneManifest: {
      ...manifest,
      UISceneConfigurations: {
        ...configurations,
        [CARPLAY_ROLE]: nextCarPlay,
      },
    },
  } as InfoPlist;
}
