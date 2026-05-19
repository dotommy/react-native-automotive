import type { ConfigPlugin } from '@expo/config-plugins';
import { withAppDelegate } from '@expo/config-plugins';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';

/**
 * Injects the `RNAutomotiveNotificationsDelegate.install()` call into
 * the host app's `AppDelegate.application(_:didFinishLaunchingWithOptions:)`
 * so that taps on notification action buttons reach JS even when the
 * app is fully killed at the moment of the tap (the system rehydrates
 * the process, the delegate is set early enough to receive the
 * UNUserNotificationCenterDelegate callback).
 *
 * Idempotent via the `mergeContents` `tag` marker — re-running
 * `expo prebuild` doesn't duplicate the injection.
 *
 * Handles both Swift (modern Expo SDK 50+ default) and Objective-C
 * AppDelegates (older bare workflow templates).
 */
const TAG = 'react-native-automotive-notifications-delegate';
const SWIFT_MODULE = 'react_native_automotive';
const DELEGATE_CLASS = 'RNAutomotiveNotificationsDelegate';

export const withNotificationsDelegate: ConfigPlugin = (config) => {
  return withAppDelegate(config, (cfg) => {
    if (cfg.modResults.language === 'swift') {
      cfg.modResults.contents = injectSwift(cfg.modResults.contents);
    } else {
      cfg.modResults.contents = injectObjc(cfg.modResults.contents);
    }
    return cfg;
  });
};

function injectSwift(src: string): string {
  // 1) Add `import react_native_automotive` near the top.
  const withImport = mergeContents({
    src,
    newSrc: `import ${SWIFT_MODULE}`,
    anchor: /^import UIKit/m,
    offset: 1,
    tag: `${TAG}-import`,
    comment: '//',
  }).contents;

  // 2) Add the install() call inside didFinishLaunchingWithOptions.
  //    Anchor: the line that opens the override function.
  return mergeContents({
    src: withImport,
    newSrc: `    ${DELEGATE_CLASS}.install()`,
    anchor: /func application\([^)]*didFinishLaunchingWithOptions[^)]*\)[^{]*\{/,
    offset: 1,
    tag: `${TAG}-install`,
    comment: '//',
  }).contents;
}

function injectObjc(src: string): string {
  // 1) Add `@import react_native_automotive;` near the top.
  const withImport = mergeContents({
    src,
    newSrc: `@import ${SWIFT_MODULE};`,
    anchor: /#import "AppDelegate\.h"/,
    offset: 1,
    tag: `${TAG}-import`,
    comment: '//',
  }).contents;

  // 2) Add the install call inside didFinishLaunchingWithOptions.
  return mergeContents({
    src: withImport,
    newSrc: `  [${DELEGATE_CLASS} install];`,
    anchor: /- \(BOOL\)application:[^{]*didFinishLaunchingWithOptions:[^{]*\{/,
    offset: 1,
    tag: `${TAG}-install`,
    comment: '//',
  }).contents;
}
