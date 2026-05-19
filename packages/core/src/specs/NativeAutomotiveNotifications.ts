import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Turbo Module spec for the **notifications** module.
 *
 * Separate from `NativeAutomotive` (the templates module) because the
 * BRIEF treats notifications as a distinct concern (Step 8) — different
 * native APIs (`INSendMessageIntent` on iOS, `CarAppExtender` on
 * Android), different lifecycle (notifications fire even when no
 * CarPlay window is connected), different consumer ergonomics.
 *
 * Codegen-compatible: only primitives, `Object` for the config dict,
 * `Promise<string>` for the assigned notification id, plus the standard
 * event-emitter plumbing methods required by codegen.
 *
 * Module name registered as `"AutomotiveNotifications"`.
 *
 * Implementation in Swift (Step 8) and Kotlin (Step 8). The legacy
 * `NativeModules.AutomotiveNotifications` path is the Old Arch fallback.
 */
export interface Spec extends TurboModule {
  send(config: Object): Promise<string>;

  // Event emitter plumbing required by codegen — used to dispatch
  // `actionPressed` events to JS listeners.
  addListener(eventType: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('AutomotiveNotifications');
