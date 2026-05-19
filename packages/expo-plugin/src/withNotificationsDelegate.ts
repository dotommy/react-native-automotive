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

// mergeContents applies the anchor regex *line by line* — multi-line
// patterns that span the function signature and its opening `{` never
// match. Anchor on the `didFinishLaunchingWithOptions` token (always
// on a single line) and pick an offset that lands inside the body.

function injectSwift(src: string): string {
  // 1) Add `import react_native_automotive` near the top.
  //    Expo SDK 53 changed the AppDelegate Swift template — it now
  //    inherits ExpoAppDelegate and the first imports are `import Expo`
  //    / `import React`, not `import UIKit`. Anchor on `import Expo`
  //    which is consistently first in modern templates.
  const withImport = mergeContents({
    src,
    newSrc: `import ${SWIFT_MODULE}`,
    anchor: /^import Expo/m,
    offset: 1,
    tag: `${TAG}-import`,
    comment: '//',
  }).contents;

  // 2) Add the install() call inside didFinishLaunchingWithOptions.
  //    Expo's Swift AppDelegate template puts the opening `{` on the
  //    same line as the function signature — offset 1 lands inside
  //    the body (first executable line).
  return mergeContents({
    src: withImport,
    newSrc: `    ${DELEGATE_CLASS}.install()`,
    anchor: /didFinishLaunchingWithOptions/,
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
  //    Expo's Obj-C AppDelegate template puts the opening `{` on its
  //    own line under the function signature — offset 2 skips both
  //    the signature and the brace, landing inside the body.
  return mergeContents({
    src: withImport,
    newSrc: `  [${DELEGATE_CLASS} install];`,
    anchor: /didFinishLaunchingWithOptions:/,
    offset: 2,
    tag: `${TAG}-install`,
    comment: '//',
  }).contents;
}
